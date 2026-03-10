"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.interviewQueue = void 0;
exports.getInterviewQueue = getInterviewQueue;
const bullmq_1 = require("bullmq");
const redis_1 = require("../config/redis");
let _interviewQueue = null;
function getInterviewQueue() {
    if (!(0, redis_1.isRedisAvailable)())
        return null;
    if (!_interviewQueue) {
        const redis = (0, redis_1.getRedis)();
        if (!redis)
            return null;
        _interviewQueue = new bullmq_1.Queue('interview', {
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
exports.interviewQueue = {
    async add(name, data, opts) {
        const queue = getInterviewQueue();
        if (queue) {
            return queue.add(name, data, opts);
        }
        // Redis not available — run analysis inline
        console.warn(`⚠️  Redis not available — running job "${name}" inline (synchronously)`);
        try {
            const { handleAudioAnalysis, handleReconstructionAnalysis } = await Promise.resolve().then(() => __importStar(require('./analysis.worker')));
            const fakeJob = { data, name, id: `inline-${Date.now()}` };
            if (name === 'analyze') {
                await handleAudioAnalysis(fakeJob);
            }
            else if (name === 'analyze-reconstruction') {
                await handleReconstructionAnalysis(fakeJob);
            }
            else {
                console.warn(`⚠️  Unknown job name for inline processing: ${name}`);
            }
            console.log(`✅ Inline job "${name}" completed successfully`);
        }
        catch (err) {
            console.error(`❌ Inline job "${name}" failed:`, err.message);
        }
        return null;
    },
};
//# sourceMappingURL=queues.js.map