import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { config } from '../config';

export const s3 = new S3Client({
    region: config.aws.region,
    credentials: {
        accessKeyId: config.aws.accessKeyId,
        secretAccessKey: config.aws.secretAccessKey,
    },
    forcePathStyle: true,
    ...(config.aws.endpoint ? { endpoint: config.aws.endpoint } : {}),
});

/**
 * Generate a pre-signed PUT URL so the frontend can upload audio/screen directly to S3/R2.
 * Expires in 15 minutes.
 */
export async function getUploadSignedUrl(key: string, contentType: string): Promise<string> {
    const command = new PutObjectCommand({
        Bucket: config.aws.bucketName,
        Key: key,
        ContentType: contentType,
    });
    return getSignedUrl(s3, command, { expiresIn: 900 });
}

/**
 * Generate a pre-signed GET URL for secure private playback/download.
 * Expires in 1 hour.
 */
export async function getDownloadSignedUrl(key: string): Promise<string> {
    const command = new GetObjectCommand({
        Bucket: config.aws.bucketName,
        Key: key,
    });
    return getSignedUrl(s3, command, { expiresIn: 3600 });
}
