import { registerAs } from '@nestjs/config'

export default registerAs('config', () => {
    return {
        jwtSecret: process.env.JWT_SECRET_KEY,
        node_env: process.env.NODE_ENV,
        mongo: {
            dbName: process.env.MONGO_DB,
            host: process.env.MONGO_HOST,
            user: process.env.MONGO_ROOT_USERNAME,
            password: process.env.MONGO_ROOT_PASSWORD,
            port: parseInt(process.env.MONGO_PORT, 10),
            connection: process.env.MONGO_CONNECTION,
        },
        nats: process.env.NATS_HOST,
        client_url: process.env.CLIENT_URL,
        collge_name: process.env.COLLEGE_NAME,
        backed_domain: process.env.BACKEND_DOMAIN,
        email: {
            smtpHost: process.env.SMTP_HOST,
            smtpPort: parseInt(process.env.SMTP_PORT),
            smtpUser: process.env.SMTP_USER,
            smtpPass: process.env.SMTP_PASSWORD,
            smtpSender: process.env.SMTP_SENDER,
        },
        redis: {
            username: process.env.REDIS_USER,
            password: process.env.REDIS_PASSWORD,
            host: process.env.REDIS_HOST,
            port: parseInt(process.env.REDIS_PORT),
        },
    }
})
