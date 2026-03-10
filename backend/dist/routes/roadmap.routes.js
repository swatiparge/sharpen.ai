"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("../db/client");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validators_1 = require("../validators");
const roadmap_validators_1 = require("../validators/roadmap.validators");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authMiddleware);
// GET /roadmap – user's improvement roadmap (WF-21)
router.get('/', async (req, res) => {
    const userId = req.userId;
    try {
        const roadmap = await client_1.db.query('SELECT * FROM roadmaps WHERE user_id = $1', [userId]);
        if (!roadmap.rows[0])
            return res.json(null);
        const tasks = await client_1.db.query('SELECT * FROM roadmap_tasks WHERE roadmap_id = $1 ORDER BY order_index', [roadmap.rows[0].id]);
        const completedCount = tasks.rows.filter((t) => t.is_done).length;
        return res.json({
            ...roadmap.rows[0],
            tasks: tasks.rows,
            progress: { completed: completedCount, total: tasks.rows.length },
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to load roadmap' });
    }
});
// PATCH /roadmap/tasks/:taskId – mark a task complete/incomplete
router.patch('/tasks/:taskId', (0, validators_1.validate)(roadmap_validators_1.updateTaskSchema), async (req, res) => {
    const { taskId } = req.params;
    const { is_done } = req.body;
    try {
        const result = await client_1.db.query('UPDATE roadmap_tasks SET is_done = $1 WHERE id = $2 RETURNING *', [is_done, taskId]);
        if (!result.rows[0])
            return res.status(404).json({ error: 'Task not found' });
        return res.json(result.rows[0]);
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to update task' });
    }
});
exports.default = router;
//# sourceMappingURL=roadmap.routes.js.map