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

    async getUsers() {
        return await this.userModel
            .find(
                {
                    status: 1,
                },
                {
                    _id: 1,
                },
            )
            .exec()
    }

    async getStudents() {
        return await this.userModel
            .find(
                {
                    status: 1,
                    $or: [
                        { user_type: Role.STUDENT },
                        { user_type: Role.STUDENT_DIRECTIVE },
                    ],
                },
                {
                    _id: 1,
                },
            )
            .exec()
    }
}
