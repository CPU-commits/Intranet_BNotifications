import { Controller } from '@nestjs/common'
import { EventPattern, Payload } from '@nestjs/microservices'
import { NotifyClassroom, NotifyGlobal } from '../models/notify_global.model'
import { WebsocketService } from '../service/websocket.service'

@Controller('notifications_ws')
export class NotificationsController {
    constructor(private notificationsService: WebsocketService) {}

    @EventPattern('notify/global')
    getNotificationsGlobal(@Payload() data: NotifyGlobal) {
        if (data.Type === 'global') {
            this.notificationsService.notifyGlobal()
            this.notificationsService.saveNotificationGlobal(data)
        } else if (data.Type === 'student') {
            this.notificationsService.notifyStudents()
            this.notificationsService.saveNotificationStudents(data)
        }
    }

    @EventPattern('notify/classroom')
    notifyClassroom(@Payload() data: NotifyClassroom) {
        this.notificationsService.saveNotificationClassroom(data)
        this.notificationsService.notifyClassroom(data.Room)
    }

    @EventPattern('delete_notification')
    deleteNotification(@Payload() idNotification: string) {
        this.notificationsService.deleteAllNotification(idNotification)
    }

    @EventPattern('notify/student')
    notifyStudent(@Payload() data: NotifyClassroom & { IDUser: string }) {
        const { IDUser, ...rest } = data
        this.notificationsService.saveNotificationClassroomStudent(
            { ...rest },
            IDUser,
        )
        this.notificationsService.notifyStudent(IDUser)
    }
}
