import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Date } from 'mongoose'

@Schema()
export class Notification {
    @Prop({ required: true })
    title: string

    @Prop({ required: true })
    url: string

    @Prop({ required: true })
    img: string

    @Prop({ required: true, type: Date })
    date: string | Date
}

export const NotificationSchema = SchemaFactory.createForClass(Notification)
