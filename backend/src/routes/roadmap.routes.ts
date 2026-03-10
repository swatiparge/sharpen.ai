import { Router, Response } from 'express';
import { db } from '../db/client';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';
import { validate } from '../validators';
import { updateTaskSchema } from '../validators/roadmap.validators';

const router = Router();
router.use(authMiddleware);

// GET /roadmap – user's improvement roadmap (WF-21)
router.get('/', async (req: AuthRequest, res: Response) => {
    const userId = req.userId!;
    try {
        const roadmap = await db.query(
            'SELECT * FROM roadmaps WHERE user_id = $1',
            [userId]
        );
        if (!roadmap.rows[0]) return res.json(null);

        const tasks = await db.query(
            'SELECT * FROM roadmap_tasks WHERE roadmap_id = $1 ORDER BY order_index',
            [roadmap.rows[0].id]
        );
        const completedCount = tasks.rows.filter((t) => t.is_done).length;
        return res.json({
            ...roadmap.rows[0],
            tasks: tasks.rows,
            progress: { completed: completedCount, total: tasks.rows.length },
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to load roadmap' });
    }
});

// PATCH /roadmap/tasks/:taskId – mark a task complete/incomplete
router.patch('/tasks/:taskId', validate(updateTaskSchema), async (req: AuthRequest, res: Response) => {
    const { taskId } = req.params;
    const { is_done } = req.body;
    try {
        const result = await db.query(
            'UPDATE roadmap_tasks SET is_done = $1 WHERE id = $2 RETURNING *',
            [is_done, taskId]
        );
        if (!result.rows[0]) return res.status(404).json({ error: 'Task not found' });
        return res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to update task' });
    }
});

export default router;
