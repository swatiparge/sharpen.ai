import { db, connectDB } from './client';

async function addNewColumns() {
    await connectDB();
    console.log('Adding new columns...');

    const queries = [
        // Users table: make password_hash nullable, add google_id and avatar_url
        `ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;`,
        `ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id TEXT UNIQUE;`,
        `ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;`,

        // Onboarding profiles: add new fields
        `ALTER TABLE onboarding_profiles ADD COLUMN IF NOT EXISTS interview_stage TEXT;`,
        `ALTER TABLE onboarding_profiles ADD COLUMN IF NOT EXISTS struggle_areas TEXT[];`,
        `ALTER TABLE onboarding_profiles ADD COLUMN IF NOT EXISTS resume_path TEXT;`,
        `ALTER TABLE interview_media ADD COLUMN IF NOT EXISTS content_type TEXT;`,
        `ALTER TABLE interviews ADD COLUMN IF NOT EXISTS failure_reason TEXT;`,
    ];

    for (const q of queries) {
        try {
            await db.query(q);
            console.log(`✅ ${q.substring(0, 60)}...`);
        } catch (err: any) {
            // Ignore "already exists" errors
            if (err.code === '42701' || err.code === '42710') {
                console.log(`⏭️  Skipped (already exists): ${q.substring(0, 60)}...`);
            } else {
                console.error(`❌ Failed: ${q}`, err.message);
            }
        }
    }

    console.log('\n✅ Schema update complete');
    process.exit(0);
}

addNewColumns();
