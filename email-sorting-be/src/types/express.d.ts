import { SessionUser } from './index';

declare global {
  namespace Express {
    interface User extends SessionUser {}
  }
}

export {};
