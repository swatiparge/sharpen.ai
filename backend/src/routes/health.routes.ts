import { Router, Response } from 'express';
import { config } from '../config';
import { AuthRequest } from '../middleware/auth.middleware';

const router = Router();

// Health check for AI service connectivity
router.get('/ai-service', async (req: AuthRequest, res: Response) => {
  try {
    console.log('[Health] Checking AI service health...');
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(`${config.aiService.url}/health`, {
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      return res.status(503).json({
        status: 'unhealthy',
        error: `AI service returned ${response.status}`,
        url: config.aiService.url,
      });
    }
    
    const data = await response.json();
    return res.json({
      status: 'healthy',
      aiService: data,
      url: config.aiService.url,
    });
  } catch (err: any) {
    console.error('[Health] AI service check failed:', err.message);
    return res.status(503).json({
      status: 'unhealthy',
      error: err.message || 'Cannot connect to AI service',
      url: config.aiService.url,
      code: err.code,
    });
  }
});

// Test endpoint to verify backend auth
router.get('/auth', async (req: AuthRequest, res: Response) => {
  return res.json({
    status: 'authenticated',
    userId: req.userId,
    message: 'Token is valid',
  });
});

export default router;
