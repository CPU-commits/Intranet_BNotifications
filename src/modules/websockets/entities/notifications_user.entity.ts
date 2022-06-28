import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Types } from 'mongoose'
import { User } from 'src/modules/user/entities/user.entity'
import { Notification } from './notification.entity'

@Schema()
export class NotificationsUser {
    @Prop({ required: true, type: Types.ObjectId, ref: User.name })
    user: Types.ObjectId | User

    @Prop({ required: true, type: Types.ObjectId, ref: Notification.name })
    notification: Types.ObjectId | Notification
}

export const NotificationsUserSchema =
    SchemaFactory.createForClass(NotificationsUser)
