import IORedis from 'ioredis';
import { config } from '../config';

let redis: IORedis | null = null;
let redisAvailable = false;

export function getRedis(): IORedis | null {
    if (!redis) {
        try {
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
        } catch {
            console.warn('⚠️  Redis not configured — analysis queue disabled.');
            redis = null;
            redisAvailable = false;
        }
    }
    return redis;
}

export function isRedisAvailable(): boolean {
    return redisAvailable;
}

// Backwards-compatible export for existing code
export { redis };
