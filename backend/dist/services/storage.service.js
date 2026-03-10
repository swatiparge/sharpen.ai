"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.s3 = void 0;
exports.getUploadSignedUrl = getUploadSignedUrl;
exports.getDownloadSignedUrl = getDownloadSignedUrl;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const config_1 = require("../config");
exports.s3 = new client_s3_1.S3Client({
    region: config_1.config.aws.region,
    credentials: {
        accessKeyId: config_1.config.aws.accessKeyId,
        secretAccessKey: config_1.config.aws.secretAccessKey,
    },
    forcePathStyle: true,
    ...(config_1.config.aws.endpoint ? { endpoint: config_1.config.aws.endpoint } : {}),
});
/**
 * Generate a pre-signed PUT URL so the frontend can upload audio/screen directly to S3/R2.
 * Expires in 15 minutes.
 */
async function getUploadSignedUrl(key, contentType) {
    const command = new client_s3_1.PutObjectCommand({
        Bucket: config_1.config.aws.bucketName,
        Key: key,
        ContentType: contentType,
    });
    return (0, s3_request_presigner_1.getSignedUrl)(exports.s3, command, { expiresIn: 900 });
}
/**
 * Generate a pre-signed GET URL for secure private playback/download.
 * Expires in 1 hour.
 */
async function getDownloadSignedUrl(key) {
    const command = new client_s3_1.GetObjectCommand({
        Bucket: config_1.config.aws.bucketName,
        Key: key,
    });
    return (0, s3_request_presigner_1.getSignedUrl)(exports.s3, command, { expiresIn: 3600 });
}
//# sourceMappingURL=storage.service.js.map