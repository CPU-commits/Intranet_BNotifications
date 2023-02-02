import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { ObjectId } from 'mongodb'
import { Model } from 'mongoose'
import { NotificationPreferenceDTO } from '../../dtos/notifications_preferences.dto'
import { UserNotificationPrefrence } from '../../entities/notification_preference.entity'

@Injectable()
export class NotificationsService {
    constructor(
        @InjectModel(UserNotificationPrefrence.name)
        private readonly userNotificationPreferenceModel: Model<UserNotificationPrefrence>,
    ) {}

    async usersWithPreference(
        users: Array<{ _id: string }>,
        preference: 'globals' | 'classroom' | 'customs',
    ) {
        return await Promise.all(
            users.filter(async (user) => {
                const notificationPreferences =
                    await this.userNotificationPreferenceModel
                        .findOne({
                            user: user._id.toString(),
                        })
                        .exec()
                return notificationPreferences.preferences.app[preference]
            }),
        )
    }

    async getPreferences(idUser: string): Promise<UserNotificationPrefrence> {
        const preferences = await this.userNotificationPreferenceModel
            .findOne({
                user: idUser,
            })
            .exec()
        if (!preferences)
            return {
                preferences: {
                    app: {
                        classroom: true,
                        globals: true,
                        customs: true,
                    },
                },
                user: new ObjectId(idUser),
            } as UserNotificationPrefrence
        return preferences
    }

    async changePreferences(
        preferences: NotificationPreferenceDTO,
        idUser: string,
    ) {
        const preferencesDB = await this.userNotificationPreferenceModel
            .findOne({
                user: idUser,
            })
            .exec()
        if (!preferencesDB) {
            const notificationPreferences =
                new this.userNotificationPreferenceModel({
                    preferences,
                    user: idUser,
                })
            return await notificationPreferences.save()
        } else {
            const updated = await this.userNotificationPreferenceModel
                .updateOne(
                    {
                        user: idUser,
                    },
                    { $set: { preferences } },
                    { new: true },
                )
                .exec()
            return updated.upsertedId
        }
    }
}
