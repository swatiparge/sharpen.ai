import { Queue } from 'bullmq';
export declare function getInterviewQueue(): Queue | null;
export declare const interviewQueue: {
    add(name: string, data: any, opts?: any): Promise<import("bullmq").Job<any, any, string> | null>;
};
//# sourceMappingURL=queues.d.ts.map