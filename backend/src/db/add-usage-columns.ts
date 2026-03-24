import { db } from './client';

export async function addUsageTrackingColumns() {
    console.log('[Migration] Adding usage tracking columns...');
    
    try {
        // Users: Track last login
        await db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;`);
        
        // Interviews: Track analysis processing time
        await db.query(`ALTER TABLE interviews ADD COLUMN IF NOT EXISTS analysis_started_at TIMESTAMPTZ;`);
        await db.query(`ALTER TABLE interviews ADD COLUMN IF NOT EXISTS analysis_completed_at TIMESTAMPTZ;`);
        
        console.log('[Migration] Usage tracking columns added successfully.');
    } catch (err) {
        console.error('[Migration] Failed to add usage tracking columns:', err);
        throw err;
    }
}

// Run if called directly
if (require.main === module) {
    addUsageTrackingColumns()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
}
