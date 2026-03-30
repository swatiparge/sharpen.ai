import IORedis from 'ioredis';
import { config } from '../config';

let redis: IORedis | null = null;
let redisAvailable = false;

export function getRedis(): IORedis | null {
    if (redis) return redis;

    try {
        console.log('[Redis] Initializing connection singleton...');
        redis = new IORedis(config.redis.url, {
            maxRetriesPerRequest: null, // required by BullMQ
            retryStrategy: (times) => {
                if (times > 3) {
                    console.warn('⚠️  Redis unavailable — analysis queue disabled. Server running without Redis.');
                    redisAvailable = false;
                    return null; // stop retrying
                }
                return Math.min(times * 500, 2000);
            },
            // We remove lazyConnect so BullMQ can manage the connection lifecycle naturally
            // or we keep it and let the first command (Queue instantiation) trigger it.
        });

        redis.on('connect', () => {
            console.log('✅ Redis connected');
            redisAvailable = true;
        });

        redis.on('error', (err) => {
            console.error('[Redis] Error:', err.message);
            redisAvailable = false;
        });

    } catch (err: any) {
        console.warn('⚠️  Redis configuration failed — analysis queue disabled.', err.message);
        redis = null;
        redisAvailable = false;
    }
    
    return redis;
}

export function isRedisAvailable(): boolean {
    return redisAvailable;
}

// Backwards-compatible export for existing code
export { redis };
