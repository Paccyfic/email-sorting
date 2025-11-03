import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import passport from './config/passport';
import { config } from './config/config';
import { logger } from './utils/logger';
import routes from './routes';

const app = express();

// --- CORS Configuration ---
// Allow connections from any frontend origin by supporting multiple origins,
// useful for frontend and backend deployed on separate servers, external IPs, or multiple domains.
// If config.frontendUrl contains a comma, treat it as a CSV of allowed origins.
// Otherwise, allow just the single domain.
const corsOrigins = (config.frontendUrl && config.frontendUrl.includes(',')) 
  ? config.frontendUrl.split(',').map((o: string) => o.trim())
  : config.frontendUrl || true; // fallback to '*' in development if not set

app.use(
  cors({
    origin: function(origin, callback) {
      // Allow requests with no origin like mobile apps or curl
      if (!origin) return callback(null, true);
      if (corsOrigins === true) return callback(null, true);
      if (typeof corsOrigins === 'string') {
        if (origin === corsOrigins) return callback(null, true);
        return callback(new Error('Not allowed by CORS'), false);
      }
      if (Array.isArray(corsOrigins)) {
        if (corsOrigins.includes(origin)) return callback(null, true);
        return callback(new Error('Not allowed by CORS'), false);
      }
      return callback(null, false);
    },
    credentials: true,
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'Set-Cookie'
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    exposedHeaders: ['Set-Cookie']
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// --- Session Configuration ---
// For cross-origin requests: use Secure cookie (HTTPS) and sameSite: 'none' when deployed
// For local HTTP dev or test, allow sameSite 'lax' and Secure: false for easier testing
app.use(
  session({
    secret: config.session.secret,
    resave: false,
    saveUninitialized: false,
    proxy: true, // trust reverse proxy when deployed (important for secure cookies on remote)
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      httpOnly: true,
      secure: config.nodeEnv === 'production' || config.nodeEnv === 'staging', // HTTPS only for prod/stage
      sameSite: config.nodeEnv === 'production' || config.nodeEnv === 'staging' ? 'none' : 'lax'
    },
  })
);

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// Request logging (skip in test environment)
if (config.nodeEnv !== 'test') {
  app.use((req: Request, res: Response, next: NextFunction) => {
    logger.info(`${req.method} ${req.path}`);
    next();
  });
}

// Mount API routes
app.use('/api', routes);

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Email Sorting API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      categories: '/api/categories',
      emails: '/api/emails',
      process: '/api/process',
    },
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error('Unhandled error', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

export default app;
