"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const config_1 = require("./config");
const client_1 = require("./db/client");
const error_middleware_1 = require("./middleware/error.middleware");
// Routes
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const onboarding_routes_1 = __importDefault(require("./routes/onboarding.routes"));
const interviews_routes_1 = __importDefault(require("./routes/interviews.routes"));
const dashboard_routes_1 = __importDefault(require("./routes/dashboard.routes"));
const gaps_routes_1 = __importDefault(require("./routes/gaps.routes"));
const roadmap_routes_1 = __importDefault(require("./routes/roadmap.routes"));
const simulations_routes_1 = __importDefault(require("./routes/simulations.routes"));
const profile_routes_1 = __importDefault(require("./routes/profile.routes"));
const health_routes_1 = __importDefault(require("./routes/health.routes"));
// Workers (only start if Redis is available)
const redis_1 = require("./config/redis");
if ((0, redis_1.getRedis)()) {
    Promise.resolve().then(() => __importStar(require('./workers/analysis.worker'))).then(() => console.log('✅ Analysis worker started'));
}
const app = (0, express_1.default)();
// ── Security & Parsing ──────────────────────────────────────
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({ origin: config_1.config.frontendUrl, credentials: true }));
app.use(express_1.default.json({ limit: '10mb' }));
app.use((0, morgan_1.default)('dev'));
// ── Health Check ────────────────────────────────────────────
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'swadhyaya.ai API', timestamp: new Date().toISOString() });
});
// ── TEMP: One-time migration (remove after use) ────────────
app.get('/migrate-once', async (_req, res) => {
    const { db } = await Promise.resolve().then(() => __importStar(require('./db/client')));
    const queries = [
        `ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;`,
        `ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id TEXT UNIQUE;`,
        `ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;`,
        `ALTER TABLE onboarding_profiles ADD COLUMN IF NOT EXISTS interview_stage TEXT;`,
        `ALTER TABLE onboarding_profiles ADD COLUMN IF NOT EXISTS struggle_areas TEXT[];`,
        `ALTER TABLE onboarding_profiles ADD COLUMN IF NOT EXISTS resume_path TEXT;`,
    ];
    const results = [];
    for (const q of queries) {
        try {
            await db.query(q);
            results.push(`✅ ${q.substring(0, 70)}`);
        }
        catch (err) {
            if (err.code === '42701' || err.code === '42710') {
                results.push(`⏭️ Skipped: ${q.substring(0, 70)}`);
            }
            else {
                results.push(`❌ ${err.message}: ${q.substring(0, 70)}`);
            }
        }
    }
    res.json({ results });
});
// ── TEMP: Debug onboarding insert ───────────────────────────
app.get('/debug-onboarding', async (_req, res) => {
    const { db } = await Promise.resolve().then(() => __importStar(require('./db/client')));
    const checks = [];
    // Check table columns
    try {
        const cols = await db.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'onboarding_profiles' ORDER BY ordinal_position`);
        checks.push({ table_columns: cols.rows });
    }
    catch (err) {
        checks.push({ table_error: err.message });
    }
    // Check if any users exist
    try {
        const users = await db.query(`SELECT id, email FROM users LIMIT 3`);
        checks.push({ users: users.rows });
    }
    catch (err) {
        checks.push({ users_error: err.message });
    }
    // Check existing onboarding profiles
    try {
        const profiles = await db.query(`SELECT id, user_id FROM onboarding_profiles LIMIT 3`);
        checks.push({ profiles: profiles.rows });
    }
    catch (err) {
        checks.push({ profiles_error: err.message });
    }
    res.json(checks);
});
// ── TEMP: Direct test insert ────────────────────────────────
app.get('/test-insert', async (_req, res) => {
    const { db } = await Promise.resolve().then(() => __importStar(require('./db/client')));
    try {
        const result = await db.query(`INSERT INTO onboarding_profiles
                (user_id, "current_role", years_experience, current_company)
             VALUES ($1, $2, $3, $4)
             RETURNING *`, ['56f477cb-ba7f-4359-8c7f-2e4f9b3c00d9', 'Frontend Engineer', '2-3', 'TestCo']);
        res.json({ success: true, row: result.rows[0] });
    }
    catch (err) {
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
app.use('/auth', auth_routes_1.default);
app.use('/onboarding', onboarding_routes_1.default);
app.use('/interviews', interviews_routes_1.default);
app.use('/dashboard', dashboard_routes_1.default);
app.use('/gaps', gaps_routes_1.default);
app.use('/roadmap', roadmap_routes_1.default);
app.use('/simulations', simulations_routes_1.default);
app.use('/profile', profile_routes_1.default);
app.use('/health', health_routes_1.default);
// ── Error Handler ────────────────────────────────────────────
app.use(error_middleware_1.errorMiddleware);
// ── Start Server ─────────────────────────────────────────────
async function bootstrap() {
    await (0, client_1.connectDB)();
    app.listen(config_1.config.port, () => {
        console.log(`\n🚀 swadhyaya.ai API running at http://localhost:${config_1.config.port}`);
        console.log(`   Health: http://localhost:${config_1.config.port}/health`);
        console.log(`   Env:    ${config_1.config.nodeEnv}\n`);
    });
}
bootstrap().catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
});
exports.default = app;
//# sourceMappingURL=index.js.map