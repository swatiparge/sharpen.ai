import dotenv from 'dotenv';
dotenv.config();

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret && process.env.NODE_ENV !== 'test') { // Allow tests to mock it
    throw new Error('FATAL: JWT_SECRET environment variable is missing.');
}

export const config = {
    appName: 'sharpen.ai',
    port: parseInt(process.env.PORT || '3000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    databaseUrl: process.env.DATABASE_URL || '',
    jwt: {
        secret: jwtSecret || '',  // Guaranteed non-empty by the throw above (empty only in test env)
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    },
    redis: {
        url: process.env.REDIS_URL || 'redis://localhost:6379',
    },
    aws: {
        region: process.env.AWS_REGION || 'us-east-1',
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
        bucketName: process.env.S3_BUCKET_NAME || 'sharpen-media',
        endpoint: process.env.S3_ENDPOINT, // optional, for R2
    },
    google: {
        clientId: process.env.GOOGLE_CLIENT_ID || '',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    },
    aiService: {
        url: process.env.AI_SERVICE_URL || 'http://localhost:8000',
    },
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3001',
};
