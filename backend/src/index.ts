import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import { config } from './config';
import { db, connectDB } from './db/client';
import { errorMiddleware } from './middleware/error.middleware';
import { saveAnalysisResults } from './workers/analysis.worker';

// Routes
import authRoutes from './routes/auth.routes';
import onboardingRoutes from './routes/onboarding.routes';
import interviewRoutes from './routes/interviews.routes';
import dashboardRoutes from './routes/dashboard.routes';
import gapsRoutes from './routes/gaps.routes';
import roadmapRoutes from './routes/roadmap.routes';
import simulationsRoutes from './routes/simulations.routes';
import profileRoutes from './routes/profile.routes';
import healthRoutes from './routes/health.routes';
import usageRoutes from './routes/usage.routes';
import learnRoutes from './routes/learn.routes';

// Workers (only start if Redis is available)
import { getRedis } from './config/redis';
if (getRedis()) {
    import('./workers/analysis.worker').then(() =>
        console.log('✅ Analysis worker started')
    );
}

const app = express();

// ── Security & Parsing ──────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: config.frontendUrl, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

// ── Health Check ────────────────────────────────────────────
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'sharpen.ai API', timestamp: new Date().toISOString() });
});

// ── Webhook (unauthenticated, server-to-server from AI service) ─
app.post('/interviews/webhook/analyze', async (req, res) => {
    try {
        const { success, interview_id, data, error } = req.body;
        if (!interview_id) {
            return res.status(400).json({ error: 'interview_id is required' });
        }
        console.log(`[Webhook] Received callback for interview ${interview_id}, success: ${success}`);
        if (success && data) {
            const interviewResult = await db.query('SELECT user_id FROM interviews WHERE id = $1', [interview_id]);
            if (!interviewResult.rows[0]) return res.status(404).json({ error: 'Interview not found' });
            await saveAnalysisResults(interview_id, interviewResult.rows[0].user_id, data);
            console.log(`[Webhook] ✅ Analysis saved for interview ${interview_id}`);
            return res.json({ message: 'Analysis results saved' });
        } else {
            await db.query("UPDATE interviews SET status = 'FAILED', failure_reason = $2 WHERE id = $1", [interview_id, error || 'AI analysis failed']);
            console.error(`[Webhook] ❌ Failure for ${interview_id}: ${error}`);
            return res.json({ message: 'Failure recorded' });
        }
    } catch (err: any) {
        console.error('[Webhook] Error:', err);
        return res.status(500).json({ error: 'Failed to process webhook' });
    }
});

// ── API Routes ──────────────────────────────────────────────
app.use('/auth', authRoutes);
app.use('/onboarding', onboardingRoutes);
app.use('/interviews', interviewRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/gaps', gapsRoutes);
app.use('/roadmap', roadmapRoutes);
app.use('/simulations', simulationsRoutes);
app.use('/profile', profileRoutes);
app.use('/learn', learnRoutes);
app.use('/health', healthRoutes);
app.use('/usage', usageRoutes);

// ── Error Handler ────────────────────────────────────────────
app.use(errorMiddleware);

// ── Start Server ─────────────────────────────────────────────
let server: ReturnType<typeof app.listen> | null = null;

async function bootstrap() {
    await connectDB();
    server = app.listen(config.port, () => {
        console.log(`\n🚀 sharpen.ai API running at http://localhost:${config.port}`);
        console.log(`   Health: http://localhost:${config.port}/health`);
        console.log(`   Env:    ${config.nodeEnv}\n`);
    });
}

bootstrap().catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
});

// ── Graceful Shutdown ─────────────────────────────────────────
function gracefulShutdown(signal: string) {
    console.log(`\n[Server] Received ${signal}. Starting graceful shutdown...`);
    
    if (server) {
        server.close(async () => {
            console.log('[Server] HTTP server closed.');
            
            try {
                // Drain DB pool cleanly
                await db.end();
                console.log('[DB] Database connection pool closed.');
                
                // Drain Redis cleanly
                const redis = getRedis();
                if (redis) {
                    await redis.quit();
                    console.log('[Redis] Redis connection closed.');
                }
                
                console.log(`[Server] Graceful shutdown complete. Exiting cleanly.`);
                process.exit(0);
            } catch (err) {
                console.error('[Server] Error during shutdown:', err);
                process.exit(1);
            }
        });
        
        // Failsafe timeout
        setTimeout(() => {
            console.error('[Server] Forcefully shutting down after 10s timeout.');
            process.exit(1);
        }, 10000);
    } else {
        process.exit(0);
    }
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

export default app;
