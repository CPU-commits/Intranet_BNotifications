import { ApiProperty } from '@nestjs/swagger'
import { Notification } from '../entities/notification.entity'

export class NotificationsRes {
    @ApiProperty({ type: [Notification] })
    notifications: Array<Notification>

    @ApiProperty({ example: 15 })
    total: number
}
