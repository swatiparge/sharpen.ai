import { Pool, PoolConfig } from 'pg';
import { config } from '../config';

const getPoolConfig = (): PoolConfig => {
    // If the connection string is valid, pg's Pool can often handle it,
    // but providing options explicitly can be safer.
    return {
        connectionString: config.databaseUrl,
        ssl: { rejectUnauthorized: false },
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000, // Increased timeout
    };
};

export const db = new Pool(getPoolConfig());

db.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
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
