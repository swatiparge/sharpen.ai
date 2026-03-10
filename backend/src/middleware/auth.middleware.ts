import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';

export interface AuthRequest extends Request {
    userId?: string;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    console.log('[Auth] No authorization header provided');
    res.status(401).json({ error: 'No authorization header' });
    return;
  }
  
  const token = authHeader.split(' ')[1];
  if (!token) {
    console.log('[Auth] No token provided in authorization header');
    res.status(401).json({ error: 'No token provided' });
    return;
  }
  
  try {
    const decoded = jwt.verify(token, config.jwt.secret) as { userId: string };
    req.userId = decoded.userId;
    console.log(`[Auth] Token validated for user: ${decoded.userId}`);
    next();
  } catch (err: any) {
    console.log(`[Auth] Token validation failed: ${err.message}`);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}
