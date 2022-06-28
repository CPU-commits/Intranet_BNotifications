import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import * as Joi from 'joi'

import { AppController } from './app.controller'
import { AppService } from './app.service'
import { WebsocketsModule } from './modules/websockets/websockets.module'
import { MailModule } from './modules/mail/mail.module'
import { UserModule } from './modules/user/user.module'
import { DatabaseModule } from './database/database.module'
import { AuthModule } from './auth/auth.module'
// Config
import config from './config'

@Module({
    imports: [
        WebsocketsModule,
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
                PORT: Joi.number().required(),
            }),
        }),
        DatabaseModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
