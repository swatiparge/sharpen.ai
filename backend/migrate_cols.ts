import { db } from './src/db/client';

async function migrate() {
    try {
        console.log('Running migration...');
        await db.query(`ALTER TABLE interviews ADD COLUMN IF NOT EXISTS top_strengths JSONB;`);
        await db.query(`ALTER TABLE interviews ADD COLUMN IF NOT EXISTS key_improvement_areas JSONB;`);
        console.log('Migration successful.');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        process.exit(0);
    }
}

migrate();
