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

@Module({
    imports: [
        ClientsModule.register([
            {
                name: 'NATS',
                transport: Transport.NATS,
                options: {
                    servers: ['nats://nats:4222'],
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
