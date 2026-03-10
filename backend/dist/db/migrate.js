"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("./client");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
async function migrate() {
    const sql = fs_1.default.readFileSync(path_1.default.join(__dirname, 'schema.sql'), 'utf-8');
    try {
        await client_1.db.query(sql);
        console.log('✅ Database migrated successfully');
    }
    catch (err) {
        console.error('❌ Migration failed:', err);
    }
    finally {
        await client_1.db.end();
    }
}
migrate();
//# sourceMappingURL=migrate.js.map