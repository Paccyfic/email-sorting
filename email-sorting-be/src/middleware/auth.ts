import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

// Re-export Request type as AuthRequest for backwards compatibility
export type AuthRequest = Request;

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  // Debug logging
  logger.debug('Auth check', {
    isAuthenticated: req.isAuthenticated?.(),
    hasUser: !!req.user,
    sessionID: req.sessionID,
    cookies: req.cookies,
  });

  if (!req.isAuthenticated || !req.isAuthenticated()) {
    console.log(req.isAuthenticated);
    console.log(req.isAuthenticated());
    console.log(req.user);
    console.log(req.sessionID);
    console.log(req.cookies);
    res.status(401).json({ error: 'Unauthorized. Please log in.' });
    return;
  }
  next();
}

export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  // Allows the request to continue whether authenticated or not
  next();
}
