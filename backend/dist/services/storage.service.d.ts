import { S3Client } from '@aws-sdk/client-s3';
export declare const s3: S3Client;
/**
 * Generate a pre-signed PUT URL so the frontend can upload audio/screen directly to S3/R2.
 * Expires in 15 minutes.
 */
export declare function getUploadSignedUrl(key: string, contentType: string): Promise<string>;
/**
 * Generate a pre-signed GET URL for secure private playback/download.
 * Expires in 1 hour.
 */
export declare function getDownloadSignedUrl(key: string): Promise<string>;
//# sourceMappingURL=storage.service.d.ts.map