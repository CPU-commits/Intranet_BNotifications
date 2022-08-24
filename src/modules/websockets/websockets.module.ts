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
    ],
    providers: [
        NotificationsGateway,
        WebsocketService,
        NotificationsStudentsGateway,
    ],
    controllers: [NotificationsController, NotificationsApiController],
})
export class WebsocketsModule {}
