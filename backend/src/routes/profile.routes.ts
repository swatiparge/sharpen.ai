import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db/client';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';
import { validate } from '../validators';
import { updateProfileSchema } from '../validators/profile.validators';

const router = Router();
router.use(authMiddleware);

// GET /profile
router.get('/', async (req: AuthRequest, res: Response) => {
    const result = await db.query(
        'SELECT id, email, full_name, created_at FROM users WHERE id = $1',
        [req.userId]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'User not found' });
    return res.json(result.rows[0]);
});

// PUT /profile – update name or password
router.put('/', validate(updateProfileSchema), async (req: AuthRequest, res: Response) => {
    const { full_name, password } = req.body;
    try {
        if (password) {
            const hash = await bcrypt.hash(password, 12);
            await db.query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [
                hash,
                req.userId,
            ]);
        }
        if (full_name) {
            await db.query('UPDATE users SET full_name = $1, updated_at = NOW() WHERE id = $2', [
                full_name,
                req.userId,
            ]);
        }
        const result = await db.query(
            'SELECT id, email, full_name, created_at FROM users WHERE id = $1',
            [req.userId]
        );
        return res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to update profile' });
    }
});

// DELETE /profile – account deletion
router.delete('/', async (req: AuthRequest, res: Response) => {
    try {
        await db.query('DELETE FROM users WHERE id = $1', [req.userId]);
        return res.json({ message: 'Account deleted successfully' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to delete account' });
    }
});

export default router;
