import {
    Inject,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Codec, connect, JSONCodec, NatsConnection } from 'nats'
import { UserService } from 'src/modules/user/service/user.service'
import { Notification } from '../entities/notification.entity'
import { NotificationsUser } from '../entities/notifications_user.entity'
import { NotifyGlobal } from '../models/notify_global.model'
import { NotificationsGateway } from '../ws/notifications.gateway'
import { NotificationsStudentsGateway } from '../ws/notifications_students.gateway'

@Injectable()
export class WebsocketService {
    nc: NatsConnection
    jc: Codec<unknown>

    constructor(
        private userService: UserService,
        private readonly notificationGGlobal: NotificationsGateway,
        private readonly notificationGStudent: NotificationsStudentsGateway,
        @InjectModel(Notification.name)
        private notificationModel: Model<Notification>,
        @InjectModel(NotificationsUser.name)
        private notificationsUserModel: Model<NotificationsUser>,
        @Inject('NATS') private natsClient: ClientProxy,
    ) {
        this.jc = JSONCodec()
        connect({
            servers: ['nats://nats:4222'],
        }).then((nats) => {
            this.nc = nats
        })
    }

    async getNotificationByID(idNotification: string) {
        return await this.notificationsUserModel.findById(idNotification)
    }

    async getNotifications(idUser: string, total = false, skip = 0) {
        const notifications = await this.notificationsUserModel
            .find({ user: idUser }, { user: 0 })
            .skip(skip)
            .sort({ date: -1 })
            .limit(10)
            .populate('notification')
            .exec()
        let totalNot: number
        if (notifications.length == 0) {
            return {
                notifications,
                total: 0,
            }
        }
        const message = await this.nc.request(
            'get_aws_token_access',
            this.jc.encode(
                notifications.map((notification) => {
                    const { img } = notification.notification as Notification
                    return img
                }),
            ),
            {
                timeout: 5000, // 5 Seconds
            },
        )
        const urls = this.jc.decode(message.data)
        if (total) {
            totalNot = await this.notificationsUserModel
                .find({ user: idUser })
                .count()
                .exec()
        }
        return {
            notifications: notifications.map((notification, i) => {
                const { title, url, date } =
                    notification.notification as Notification
                return {
                    _id: notification._id,
                    date,
                    notification: {
                        title,
                        url,
                        img: urls[i],
                    },
                }
            }),
            total: totalNot,
        }
    }

    async insertNotification(notification: NotifyGlobal) {
        const date = new Date()
        const newNotification = new this.notificationModel({
            title: notification.Title,
            url: notification.Link,
            img: notification.Img,
            date,
        })
        return await newNotification.save()
    }

    async saveNotificationGlobal(data: NotifyGlobal) {
        const users = await this.userService.getUsers()
        const notification = await this.insertNotification(data)
        const notifications = users.map((user) => {
            return {
                user: user._id.toString(),
                notification: notification._id.toString(),
            }
        })
        const notificationsData = await this.notificationsUserModel.insertMany(
            notifications,
        )
        return notificationsData
    }

    async saveNotificationStudents(data: NotifyGlobal) {
        const students = await this.userService.getStudents()
        const notification = await this.insertNotification(data)
        const date = new Date()
        const notifications = students.map((student) => {
            return {
                user: student._id.toString(),
                notification: notification._id.toString(),
                date,
            }
        })
        const notificationsData = await this.notificationsUserModel.insertMany(
            notifications,
        )
        return notificationsData
    }

    notifyGlobal() {
        this.notificationGGlobal.emitNotificationsBradcast('notify')
    }

    notifyStudents() {
        this.notificationGStudent.emitNotificationsBradcast('notify')
    }

    async deleteNotifiaction(idUser: string, idNotification: string) {
        const notification = await this.getNotificationByID(idNotification)
        if (!notification)
            throw new NotFoundException('No existe esta notificación')
        if (notification.user.toString() !== idUser)
            throw new UnauthorizedException('La notificación no le pertenece')
        return await notification.deleteOne()
    }
}
