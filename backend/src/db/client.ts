import { Pool, PoolConfig } from 'pg';
import { config } from '../config';

const getPoolConfig = (): PoolConfig => {
    // If the connection string is valid, pg's Pool can often handle it,
    // but providing options explicitly can be safer.
    return {
        connectionString: config.databaseUrl,
        ssl: { rejectUnauthorized: false },
        max: Number(process.env.DB_POOL_MAX || 10),
        idleTimeoutMillis: 60000,        // 60s before an idle client is closed
        connectionTimeoutMillis: 10000,  // 10s to get a connection from pool
        keepAlive: true,                 // Send TCP keepalives to prevent Supabase timeout
        keepAliveInitialDelayMillis: 10000,
    };
};

export const db = new Pool(getPoolConfig());

db.on('error', (err: Error) => {
    // Log the error but do NOT exit — a stale connection should not crash the server.
    // pg-pool will automatically create a new connection on the next query.
    console.error('[DB] Idle client error (non-fatal, pool will recover):', err.message);
});

export async function connectDB(): Promise<void> {
    try {
        const client = await db.connect();
        console.log('✅ PostgreSQL connected');
        client.release();
    } catch (err) {
        console.error('❌ Failed to connect to PostgreSQL:', err);
        throw err;
    }
}
