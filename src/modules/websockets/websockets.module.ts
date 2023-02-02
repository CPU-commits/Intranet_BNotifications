import { Module } from '@nestjs/common'
import { NotificationsGateway } from './ws/notifications.gateway'
import { WebsocketService } from './service/websocket.service'
import { NotificationsController } from './controller/notifications.controller'
import { UserModule } from '../user/user.module'
import { ClientsModule, Transport } from '@nestjs/microservices'
import { MongooseModule } from '@nestjs/mongoose'
import {
    NotificationSchema,
    Notification,
} from './entities/notification.entity'
import {
    NotificationsUser,
    NotificationsUserSchema,
} from './entities/notifications_user.entity'
import { NotificationsApiController } from './controller/notifications_api.controller'
import { NotificationsStudentsGateway } from './ws/notifications_students.gateway'
import config from 'src/config'
import { ConfigType } from '@nestjs/config'
import { WinstonModule } from 'nest-winston'
import * as winston from 'winston'
import { NotificationsModule } from '../notifications/notifications.module'
import { MemoryModule } from '../memory/memory.module'

@Module({
    imports: [
        ClientsModule.registerAsync([
            {
                name: 'NATS_CLIENT',
                inject: [config.KEY],
                useFactory: (configService: ConfigType<typeof config>) => {
                    return {
                        transport: Transport.NATS,
                        options: {
                            servers: [`nats://${configService.nats}:4222`],
                        },
                    }
                },
            },
        ]),
        MongooseModule.forFeature([
            {
                name: Notification.name,
                schema: NotificationSchema,
            },
            {
                name: NotificationsUser.name,
                schema: NotificationsUserSchema,
            },
        ]),
        UserModule,
        WinstonModule.forRootAsync({
            useFactory: (configService: ConfigType<typeof config>) => {
                const { timestamp, json, combine, simple } = winston.format
                const transports: Array<winston.transport> = [
                    new winston.transports.File({
                        filename: 'error.log',
                        level: 'error',
                        dirname: `${process.cwd()}/logs`,
                        maxsize: 10000000,
                        maxFiles: 2,
                    }),
                    new winston.transports.File({
                        filename: 'combined.log',
                        dirname: `${process.cwd()}/logs`,
                        maxsize: 10000000,
                        maxFiles: 3,
                        level: 'info',
                        format: combine(json(), timestamp()),
                    }),
                ]
                if (configService.node_env !== 'prod')
                    transports.push(
                        new winston.transports.Console({
                            format: combine(simple(), timestamp()),
                        }),
                    )
                return {
                    transports,
                    format: combine(timestamp(), json()),
                }
            },
            inject: [config.KEY],
        }),
        NotificationsModule,
        MemoryModule,
    ],
    providers: [
        NotificationsGateway,
        WebsocketService,
        NotificationsStudentsGateway,
    ],
    controllers: [NotificationsController, NotificationsApiController],
})
export class WebsocketModule {}
