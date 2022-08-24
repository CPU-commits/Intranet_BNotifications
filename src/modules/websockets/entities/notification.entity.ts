import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Date, Types } from 'mongoose'
import { Subject } from 'src/modules/user/entities/subject.entity'
import { TypeClassroom } from '../models/notify_global.model'

@Schema()
export class Notification {
    @Prop({ required: true })
    title: string

    @Prop({ required: true })
    url: string

    @Prop()
    img: string

    @Prop({ type: Types.ObjectId, ref: Subject.name })
    subject: Types.ObjectId

    @Prop({ type: String, enum: ['grade', 'publication', 'work'] })
    type_classroom: keyof typeof TypeClassroom

    @Prop({ required: true, enum: ['global', 'classroom'] })
    type: string

    @Prop({ required: true, type: Date })
    date: string | Date
}

export const NotificationSchema = SchemaFactory.createForClass(Notification)
