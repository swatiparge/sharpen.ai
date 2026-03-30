import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { db } from '../db/client';
import { config } from '../config';
import { validate } from '../validators';
import { signupSchema, loginSchema, googleAuthSchema } from '../validators/auth.validators';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';

const router = Router();
const googleClient = new OAuth2Client(config.google.clientId);

// ── Rate Limiter ────────────────────────────────────────────────────────
const rateLimitMap = new Map<string, { count: number, resetTime: number }>();

// Cleanup expired rate-limit entries every 15 minutes to prevent memory leak
setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitMap) {
        if (record.resetTime < now) rateLimitMap.delete(key);
    }
}, 15 * 60 * 1000).unref();

function authLimiter(req: Request, res: Response, next: import('express').NextFunction) {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const windowMs = 15 * 60 * 1000;
    
    let record = rateLimitMap.get(ip);
    if (!record || record.resetTime < now) {
        record = { count: 1, resetTime: now + windowMs };
    } else {
        record.count++;
    }
    
    rateLimitMap.set(ip, record);
    
    if (record.count > 10) {
        return res.status(429).json({ error: 'Too many authentication attempts, please try again later.' });
    }
    next();
}

// POST /auth/google – Google OAuth login/signup
router.post('/google', authLimiter, validate(googleAuthSchema), async (req: Request, res: Response) => {
    const { credential } = req.body;
    try {
        // Verify the Google ID token
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: config.google.clientId,
        });

        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
            return res.status(401).json({ error: 'Invalid Google token' });
        }

        const { sub: googleId, email, name, picture } = payload;

        // Check if user exists (by google_id or email)
        let userResult = await db.query(
            'SELECT * FROM users WHERE google_id = $1 OR email = $2',
            [googleId, email]
        );

        let user = userResult.rows[0];

        if (!user) {
            // Create new user
            const result = await db.query(
                `INSERT INTO users (email, full_name, google_id, avatar_url)
                 VALUES ($1, $2, $3, $4)
                 RETURNING id, email, full_name, google_id, avatar_url, credits_balance, created_at`,
                [email, name || email, googleId, picture]
            );
            user = result.rows[0];

            // Log welcome bonus transaction
            await db.query(
                'INSERT INTO credit_transactions (user_id, amount, transaction_type, description) VALUES ($1, $2, $3, $4)',
                [user.id, 60, 'WELCOME_BONUS', 'Initial welcome bonus (60 mins)']
            );
        } else if (!user.google_id) {
            // Link Google account to existing email user
            await db.query(
                'UPDATE users SET google_id = $1, avatar_url = $2, updated_at = NOW() WHERE id = $3',
                [googleId, picture, user.id]
            );
            user.google_id = googleId;
            user.avatar_url = picture;
        }

        // Check if onboarding is done
        const onboarding = await db.query(
            'SELECT onboarding_done FROM onboarding_profiles WHERE user_id = $1',
            [user.id]
        );

        const token = jwt.sign({ userId: user.id }, config.jwt.secret, {
            expiresIn: config.jwt.expiresIn as any,
        });

        // Update last login
        await db.query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [user.id]);

        return res.json({
            user: {
                email: user.email,
                full_name: user.full_name,
                avatar_url: user.avatar_url,
                credits_balance: user.credits_balance,
            },
            token,
            onboarding_done: onboarding.rows[0]?.onboarding_done || false,
        });
    } catch (err) {
        console.error('Google auth error:', err);
        return res.status(401).json({ error: 'Google authentication failed' });
    }
});

// POST /auth/signup (kept as fallback)
router.post('/signup', authLimiter, validate(signupSchema), async (req: Request, res: Response) => {
    const { email, password, full_name } = req.body;
    try {
        const existing = await db.query('SELECT id FROM users WHERE email = $1', [email]);
        if (existing.rows.length > 0) {
            return res.status(409).json({ error: 'Email already registered' });
        }
        const password_hash = await bcrypt.hash(password, 12);
        const result = await db.query(
            'INSERT INTO users (email, password_hash, full_name) VALUES ($1, $2, $3) RETURNING id, email, full_name, credits_balance, created_at',
            [email, password_hash, full_name]
        );
        const user = result.rows[0];

        // Log welcome bonus transaction
        await db.query(
            'INSERT INTO credit_transactions (user_id, amount, transaction_type, description) VALUES ($1, $2, $3, $4)',
            [user.id, 60, 'WELCOME_BONUS', 'Initial welcome bonus (60 mins)']
        );

        // Update last login
        await db.query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [user.id]);

        const token = jwt.sign({ userId: user.id }, config.jwt.secret, {
            expiresIn: config.jwt.expiresIn as any,
        });
        return res.status(201).json({ user, token });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Server error during signup' });
    }
});

// POST /auth/login (kept as fallback)
router.post('/login', authLimiter, validate(loginSchema), async (req: Request, res: Response) => {
    const { email, password } = req.body;
    try {
        const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];
        if (!user || !user.password_hash) return res.status(401).json({ error: 'Invalid credentials' });

        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) return res.status(401).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ userId: user.id }, config.jwt.secret, {
            expiresIn: config.jwt.expiresIn as any,
        });

        // Update last login
        await db.query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [user.id]);

        return res.json({
            user: { 
                id: user.id, 
                email: user.email, 
                full_name: user.full_name,
                credits_balance: user.credits_balance 
            },
            token,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Server error during login' });
    }
});

// GET /auth/me – get current user profile (with credits)
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const result = await db.query(
            'SELECT id, email, full_name, avatar_url, credits_balance FROM users WHERE id = $1',
            [req.userId]
        );
        const user = result.rows[0];
        if (!user) return res.status(404).json({ error: 'User not found' });
        return res.json({ user });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Server error' });
    }
});

export default router;
