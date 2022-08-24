import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Types } from 'mongoose'

@Schema()
export class Subject {
    @Prop({ required: true })
    subject: string

    @Prop({ type: Types.ObjectId })
    specialty: Types.ObjectId
}

export const SubjectSchema = SchemaFactory.createForClass(Subject)
