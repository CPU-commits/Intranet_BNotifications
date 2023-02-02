import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Types } from 'mongoose'
import { User } from 'src/modules/user/entities/user.entity'

class AppPreferences {
    globals: boolean
    classroom: boolean
    customs: boolean
}

class Preferences {
    app: AppPreferences
}

@Schema({ collection: 'user_notification_prefrences' })
export class UserNotificationPrefrence {
    @Prop({ type: Types.ObjectId, ref: User.name })
    user: User | Types.ObjectId

    @Prop({
        type: {
            app: {
                globals: { type: Boolean },
                classroom: { type: Boolean },
                customs: { type: Boolean },
            },
        },
    })
    preferences: Preferences
}

export const UserNotificationPrefrenceSchema = SchemaFactory.createForClass(
    UserNotificationPrefrence,
)
