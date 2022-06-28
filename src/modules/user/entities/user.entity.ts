import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Role } from 'src/auth/models/roles.model'

@Schema({ versionKey: false })
export class User {
    @Prop({ required: true, maxlength: 100 })
    name: string

    @Prop({ required: true, maxlength: 100 })
    first_lastname: string

    @Prop({ required: true, maxlength: 100 })
    second_lastname: string

    @Prop({ required: true })
    password: string

    @Prop({ required: true, unique: true })
    rut: string

    @Prop({
        required: true,
        enum: [
            Role.STUDENT,
            Role.STUDENT_DIRECTIVE,
            Role.ATTORNEY,
            Role.TEACHER,
            Role.DIRECTIVE,
            Role.DIRECTOR,
        ],
    })
    user_type: string

    @Prop({ default: 1, isInteger: true, min: 0 })
    status: number

    @Prop()
    email?: string
}

export const UserSchema = SchemaFactory.createForClass(User)
UserSchema.index(
    { email: 1 },
    {
        unique: true,
        partialFilterExpression: { email: { $type: 'string' } },
    },
)
