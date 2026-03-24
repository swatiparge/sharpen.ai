import { db } from './src/db/client';

async function test() {
    try {
        const res = await db.query('SELECT NOW()');
        console.log('DB Connection Success:', res.rows[0]);
    } catch (err) {
        console.error('DB Connection Failed:', err);
    } finally {
        await db.end();
    }
}

test();
