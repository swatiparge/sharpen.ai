import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import { config } from './config';
import { connectDB } from './db/client';
import { errorMiddleware } from './middleware/error.middleware';

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
    res.json({ status: 'ok', service: 'swadhyaya.ai API', timestamp: new Date().toISOString() });
});

// ── TEMP: One-time migration (remove after use) ────────────
app.get('/migrate-once', async (_req, res) => {
    const { db } = await import('./db/client');
    const queries = [
        `ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;`,
        `ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id TEXT UNIQUE;`,
        `ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;`,
        `ALTER TABLE onboarding_profiles ADD COLUMN IF NOT EXISTS interview_stage TEXT;`,
        `ALTER TABLE onboarding_profiles ADD COLUMN IF NOT EXISTS struggle_areas TEXT[];`,
        `ALTER TABLE onboarding_profiles ADD COLUMN IF NOT EXISTS resume_path TEXT;`,
    ];
    const results: string[] = [];
    for (const q of queries) {
        try {
            await db.query(q);
            results.push(`✅ ${q.substring(0, 70)}`);
        } catch (err: any) {
            if (err.code === '42701' || err.code === '42710') {
                results.push(`⏭️ Skipped: ${q.substring(0, 70)}`);
            } else {
                results.push(`❌ ${err.message}: ${q.substring(0, 70)}`);
            }
        }
    }
    res.json({ results });
});

// ── TEMP: Debug onboarding insert ───────────────────────────
app.get('/debug-onboarding', async (_req, res) => {
    const { db } = await import('./db/client');
    const checks: any[] = [];

    // Check table columns
    try {
        const cols = await db.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'onboarding_profiles' ORDER BY ordinal_position`);
        checks.push({ table_columns: cols.rows });
    } catch (err: any) {
        checks.push({ table_error: err.message });
    }

    // Check if any users exist
    try {
        const users = await db.query(`SELECT id, email FROM users LIMIT 3`);
        checks.push({ users: users.rows });
    } catch (err: any) {
        checks.push({ users_error: err.message });
    }

    // Check existing onboarding profiles
    try {
        const profiles = await db.query(`SELECT id, user_id FROM onboarding_profiles LIMIT 3`);
        checks.push({ profiles: profiles.rows });
    } catch (err: any) {
        checks.push({ profiles_error: err.message });
    }

    res.json(checks);
});

// ── TEMP: Direct test insert ────────────────────────────────
app.get('/test-insert', async (_req, res) => {
    const { db } = await import('./db/client');
    try {
        const result = await db.query(
            `INSERT INTO onboarding_profiles
                (user_id, "current_role", years_experience, current_company)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            ['56f477cb-ba7f-4359-8c7f-2e4f9b3c00d9', 'Frontend Engineer', '2-3', 'TestCo']
        );
        res.json({ success: true, row: result.rows[0] });
    } catch (err: any) {
        res.json({
            success: false,
            error: err.message,
            code: err.code,
            detail: err.detail,
            hint: err.hint,
            position: err.position,
            where: err.where,
        });
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
  app.use('/health', healthRoutes);

// ── Error Handler ────────────────────────────────────────────
app.use(errorMiddleware);

// ── Start Server ─────────────────────────────────────────────
async function bootstrap() {
    await connectDB();
    app.listen(config.port, () => {
        console.log(`\n🚀 swadhyaya.ai API running at http://localhost:${config.port}`);
        console.log(`   Health: http://localhost:${config.port}/health`);
        console.log(`   Env:    ${config.nodeEnv}\n`);
    });
}

bootstrap().catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
});

export default app;
