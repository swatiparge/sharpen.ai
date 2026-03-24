import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';
import { config } from '../config';

const router = Router();
router.use(authMiddleware);

// POST /learn/generate – dynamically generate a lesson
router.post('/generate', async (req: AuthRequest, res: Response) => {
    const { topic } = req.body;
    if (!topic) {
        return res.status(400).json({ error: 'Topic is required' });
    }

    try {
        console.log(`[Learn] Requesting lesson for topic: ${topic}`);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout
        
        const response = await fetch(`${config.aiService.url.replace('localhost', '127.0.0.1')}/generate-lesson`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ topic }),
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            throw new Error(`AI Service responded with status ${response.status}`);
        }
        
        const data = await response.json();
        return res.json(data);
    } catch (err: any) {
        console.error('[Learn] Failed to generate lesson:', err.message);
        return res.status(500).json({ error: 'Failed to generate lesson', details: err.message });
    }
});

export default router;
