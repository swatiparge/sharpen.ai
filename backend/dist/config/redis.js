"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redis = void 0;
exports.getRedis = getRedis;
exports.isRedisAvailable = isRedisAvailable;
const ioredis_1 = __importDefault(require("ioredis"));
const config_1 = require("../config");
let redis = null;
exports.redis = redis;
let redisAvailable = false;
function getRedis() {
    if (!redis) {
        try {
            exports.redis = redis = new ioredis_1.default(config_1.config.redis.url, {
                maxRetriesPerRequest: null, // required by BullMQ
                retryStrategy: (times) => {
                    if (times > 3) {
                        console.warn('⚠️  Redis unavailable — analysis queue disabled. Server running without Redis.');
                        redisAvailable = false;
                        return null; // stop retrying
                    }
                    return Math.min(times * 500, 2000);
                },
                lazyConnect: true,
            });
            redis.on('connect', () => {
                console.log('✅ Redis connected');
                redisAvailable = true;
            });
            redis.on('error', () => {
                redisAvailable = false;
            });
            // Attempt to connect immediately so we know the status
            redis.connect().catch(() => {
                redisAvailable = false;
            });
        }
        catch {
            console.warn('⚠️  Redis not configured — analysis queue disabled.');
            exports.redis = redis = null;
            redisAvailable = false;
        }
    }
    return redis;
}
function isRedisAvailable() {
    return redisAvailable;
}
//# sourceMappingURL=redis.js.map