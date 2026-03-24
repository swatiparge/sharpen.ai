import { db } from './src/db/client';

async function checkMetrics() {
    try {
        console.log('--- Checking latest interview metrics ---');
        const latest = await db.query('SELECT id, name, status FROM interviews ORDER BY created_at DESC LIMIT 1');
        if (latest.rows.length === 0) {
            console.log('No interviews found.');
            return;
        }
        const interview = latest.rows[0];
        console.log(`Interview: ${interview.name} (${interview.id}) - Status: ${interview.status}`);

        const metrics = await db.query('SELECT id, metric_name, score FROM metrics WHERE interview_id = $1', [interview.id]);
        console.log(`\nFound ${metrics.rows.length} metrics:`);
        console.table(metrics.rows);
        
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await db.end();
    }
}

checkMetrics();
