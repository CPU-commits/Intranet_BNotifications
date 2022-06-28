import { Controller } from '@nestjs/common'
import { MessagePattern, Payload } from '@nestjs/microservices'
import { NotifyGlobal } from '../models/notify_global.model'
import { WebsocketService } from '../service/websocket.service'

@Controller('notifications_ws')
export class NotificationsController {
    constructor(private notificationsService: WebsocketService) {}

    @MessagePattern('notify/global')
    getNotificationsGlobal(@Payload() data: NotifyGlobal) {
        if (data.Type === 'global') {
            this.notificationsService.notifyGlobal()
            this.notificationsService.saveNotificationGlobal(data)
        } else if (data.Type === 'student') {
            this.notificationsService.notifyStudents()
            this.notificationsService.saveNotificationStudents(data)
        }
    }
}
