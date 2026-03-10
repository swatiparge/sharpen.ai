import { db } from './client';
import fs from 'fs';
import path from 'path';

async function migrate() {
    const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
    try {
        await db.query(sql);
        console.log('✅ Database migrated successfully');
    } catch (err) {
        console.error('❌ Migration failed:', err);
    } finally {
        await db.end();
    }
}

migrate();
