import { Request, Response, NextFunction } from 'express';
import { config } from '../config';

export function errorMiddleware(
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
): void {
    console.error(err.stack);
    const statusCode = (err as any).status || 500;
    res.status(statusCode).json({
        error: config.nodeEnv === 'production' ? 'Something went wrong' : err.message,
    });
}
