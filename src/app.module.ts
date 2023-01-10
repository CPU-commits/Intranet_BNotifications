import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import * as Joi from 'joi'

import { AppController } from './app.controller'
import { AppService } from './app.service'
import { MailModule } from './modules/mail/mail.module'
import { UserModule } from './modules/user/user.module'
import { DatabaseModule } from './database/database.module'
import { AuthModule } from './auth/auth.module'
// Config
import config from './config'
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler'
import { APP_GUARD } from '@nestjs/core'
import { MainController } from './main/main.controller'
import { CorrelationIdMiddleware } from './correlation-id.middleware'
import { WebsocketModule } from './modules/websockets/websockets.module'

@Module({
    imports: [
        WebsocketModule,
        MailModule,
        UserModule,
        AuthModule,
        ConfigModule.forRoot({
            envFilePath: '.env',
            load: [config],
            isGlobal: true,
            validationSchema: Joi.object({
                JWT_SECRET_KEY: Joi.string().required(),
                NODE_ENV: Joi.string().required(),
                MONGO_DB: Joi.string().required(),
                MONGO_HOST: Joi.string().required(),
                MONGO_ROOT_USERNAME: Joi.string().required(),
                MONGO_ROOT_PASSWORD: Joi.string().required(),
                MONGO_PORT: Joi.number().required(),
                MONGO_CONNECTION: Joi.string().required(),
                NATS_HOST: Joi.string().required(),
                CLIENT_URL: Joi.string().required(),
            }),
        }),
        DatabaseModule,
        ThrottlerModule.forRoot({
            ttl: 1,
            limit: 7,
        }),
    ],
    controllers: [AppController, MainController],
    providers: [
        AppService,
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
    ],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(CorrelationIdMiddleware).forRoutes('*')
    }
}
