"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
exports.connectDB = connectDB;
const pg_1 = require("pg");
const config_1 = require("../config");
const getPoolConfig = () => {
    // If the connection string is valid, pg's Pool can often handle it,
    // but providing options explicitly can be safer.
    return {
        connectionString: config_1.config.databaseUrl,
        ssl: { rejectUnauthorized: false },
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000, // Increased timeout
    };
};
exports.db = new pg_1.Pool(getPoolConfig());
exports.db.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});
async function connectDB() {
    try {
        const client = await exports.db.connect();
        console.log('✅ PostgreSQL connected');
        client.release();
    }
    catch (err) {
        console.error('❌ Failed to connect to PostgreSQL:', err);
        throw err;
    }
}
//# sourceMappingURL=client.js.map