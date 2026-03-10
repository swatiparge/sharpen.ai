import dotenv from 'dotenv';
dotenv.config();

export const config = {
    appName: 'swadhyaya.ai',
    port: parseInt(process.env.PORT || '3000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    databaseUrl: process.env.DATABASE_URL || '',
    jwt: {
        secret: process.env.JWT_SECRET || 'changeme',
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    },
    redis: {
        url: process.env.REDIS_URL || 'redis://localhost:6379',
    },
    aws: {
        region: process.env.AWS_REGION || 'us-east-1',
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
        bucketName: process.env.S3_BUCKET_NAME || 'interviewos-media',
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
