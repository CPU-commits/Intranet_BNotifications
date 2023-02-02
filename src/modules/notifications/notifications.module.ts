import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { NotificationsController } from './controllers/notifications/notifications.controller'
import {
    UserNotificationPrefrence,
    UserNotificationPrefrenceSchema,
} from './entities/notification_preference.entity'
import { NotificationsService } from './services/notifications/notifications.service'

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: UserNotificationPrefrence.name,
                schema: UserNotificationPrefrenceSchema,
            },
        ]),
    ],
    controllers: [NotificationsController],
    providers: [NotificationsService],
    exports: [NotificationsService],
})
export class NotificationsModule {}
