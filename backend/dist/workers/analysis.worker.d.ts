import { Worker, Job } from 'bullmq';
import { AnalyzeJobPayload, ReconstructionAnalyzeJobPayload } from '../types';
export declare function handleAudioAnalysis(job: Job<AnalyzeJobPayload>): Promise<void>;
export declare function handleReconstructionAnalysis(job: Job<ReconstructionAnalyzeJobPayload>): Promise<void>;
export declare const analysisWorker: Worker<any, any, string>;
//# sourceMappingURL=analysis.worker.d.ts.map