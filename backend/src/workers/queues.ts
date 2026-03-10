import { Queue } from 'bullmq';
import { getRedis, isRedisAvailable } from '../config/redis';

let _interviewQueue: Queue | null = null;

export function getInterviewQueue(): Queue | null {
    if (!isRedisAvailable()) return null;

    if (!_interviewQueue) {
        const redis = getRedis();
        if (!redis) return null;

        _interviewQueue = new Queue('interview', {
            connection: redis,
            defaultJobOptions: {
                attempts: 1,
                removeOnComplete: 100,
                removeOnFail: 200,
            },
        });
    }
    return _interviewQueue;
}

// Falls back to inline (synchronous) processing when Redis is unavailable
export const interviewQueue = {
    async add(name: string, data: any, opts?: any) {
        const queue = getInterviewQueue();
        if (queue) {
            return queue.add(name, data, opts);
        }

        // Redis not available — run analysis inline
        console.warn(`⚠️  Redis not available — running job "${name}" inline (synchronously)`);
        try {
            const { handleAudioAnalysis, handleReconstructionAnalysis } = await import('./analysis.worker');
            const fakeJob = { data, name, id: `inline-${Date.now()}` } as any;

            if (name === 'analyze') {
                await handleAudioAnalysis(fakeJob);
            } else if (name === 'analyze-reconstruction') {
                await handleReconstructionAnalysis(fakeJob);
            } else {
                console.warn(`⚠️  Unknown job name for inline processing: ${name}`);
            }
            console.log(`✅ Inline job "${name}" completed successfully`);
        } catch (err: any) {
            console.error(`❌ Inline job "${name}" failed:`, err.message);
        }
        return null;
    },
};
