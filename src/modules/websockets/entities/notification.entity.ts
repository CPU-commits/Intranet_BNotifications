import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { ApiProperty } from '@nestjs/swagger'
import { Date, Types } from 'mongoose'
import { Subject } from 'src/modules/user/entities/subject.entity'
import { TypeClassroom } from '../models/notify_global.model'

@Schema()
export class Notification {
    @ApiProperty({
        example: 'Notification Title',
    })
    @Prop({ required: true })
    title: string

    @ApiProperty({
        example: '/foo/abc',
    })
    @Prop({ required: true })
    url: string

    @ApiProperty({
        example: 'key/$34fe!2w',
    })
    @Prop()
    img: string

    @ApiProperty({
        example: '638660ca141aa4ee9faf07e8',
        type: 'string',
    })
    @Prop({ type: Types.ObjectId, ref: Subject.name })
    subject: Types.ObjectId

    @ApiProperty({
        example: 'grade',
        enum: ['grade', 'publication', 'work'],
    })
    @Prop({ type: String, enum: ['grade', 'publication', 'work'] })
    type_classroom: keyof typeof TypeClassroom

    @ApiProperty({
        example: 'global',
        enum: ['global', 'classroom'],
    })
    @Prop({ required: true, enum: ['global', 'classroom'] })
    type: string

    @ApiProperty({
        example: '2022-08-08T15:32:58.384+00:00',
    })
    @Prop({ required: true, type: Date })
    date: string | Date
}

export const NotificationSchema = SchemaFactory.createForClass(Notification)
