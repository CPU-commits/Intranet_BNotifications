import { Inject, Injectable } from '@nestjs/common'
import { ConfigType } from '@nestjs/config'
import { InjectModel } from '@nestjs/mongoose'
import * as jwt from 'jsonwebtoken'
import { Model } from 'mongoose'
import { Role } from 'src/auth/models/roles.model'
import config from 'src/config'
import { User } from '../entities/user.entity'

@Injectable()
export class UserService {
    constructor(
        @Inject(config.KEY) private configService: ConfigType<typeof config>,
        @InjectModel(User.name) private userModel: Model<User>,
    ) {}

    jwtValidation(token: string) {
        try {
            const decoded = jwt.verify(token, this.configService.jwtSecret)
            return { success: true, user: decoded }
        } catch (err) {
            return { success: false }
        }
    }

    async getUsers(skip = 0, limit = 200) {
        const users = await this.userModel
            .aggregate([
                {
                    $match: {
                        status: 1,
                    },
                },
                {
                    $project: {
                        _id: 1,
                    },
                },
                {
                    $skip: skip,
                },
                {
                    $limit: limit,
                },
                {
                    $addFields: {
                        _id: {
                            $toString: '$_id',
                        },
                    },
                },
                {
                    $lookup: {
                        from: 'user_notification_prefrences',
                        foreignField: 'user',
                        localField: '_id',
                        as: 'preferences',
                    },
                },
                {
                    $addFields: {
                        preferences: {
                            $arrayElemAt: ['$preferences', 0],
                        },
                    },
                },
                {
                    $match: {
                        $or: [
                            {
                                'preferences.preferences.app.globals': true,
                            },
                            {
                                'preferences.preferences.app.globals': {
                                    $exists: false,
                                },
                            },
                        ],
                    },
                },
                {
                    $project: {
                        _id: 1,
                    },
                },
            ])
            .exec()
        const usersCount = await this.userModel.count({ status: 1 }).exec()
        return {
            users,
            hasMore: skip + limit < usersCount,
        }
    }

    async getStudents(skip = 0, limit = 200) {
        const users = await this.userModel
            .aggregate([
                {
                    $match: {
                        status: 1,
                        $or: [
                            { user_type: Role.STUDENT },
                            { user_type: Role.STUDENT_DIRECTIVE },
                        ],
                    },
                },
                {
                    $project: {
                        _id: 1,
                    },
                },
                {
                    $skip: skip,
                },
                {
                    $limit: limit,
                },
                {
                    $addFields: {
                        _id: {
                            $toString: '$_id',
                        },
                    },
                },
                {
                    $lookup: {
                        from: 'user_notification_prefrences',
                        foreignField: 'user',
                        localField: '_id',
                        as: 'preferences',
                    },
                },
                {
                    $addFields: {
                        preferences: {
                            $arrayElemAt: ['$preferences', 0],
                        },
                    },
                },
                {
                    $match: {
                        $or: [
                            {
                                'preferences.preferences.app.globals': true,
                            },
                            {
                                'preferences.preferences.app.globals': {
                                    $exists: false,
                                },
                            },
                        ],
                    },
                },
                {
                    $project: {
                        _id: 1,
                    },
                },
            ])
            .exec()
        const usersCount = await this.userModel.count({ status: 1 }).exec()
        return {
            users,
            hasMore: skip + limit < usersCount,
        }
    }
}
