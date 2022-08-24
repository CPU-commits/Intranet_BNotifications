import {
    Inject,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { lastValueFrom } from 'rxjs'
import { PayloadToken } from 'src/auth/models/token.model'
import { Student } from 'src/modules/user/entities/student.entity'
import { UserService } from 'src/modules/user/service/user.service'
import { Notification } from '../entities/notification.entity'
import { NotificationsUser } from '../entities/notifications_user.entity'
import { NotifyClassroom, NotifyGlobal } from '../models/notify_global.model'
import { NotificationsGateway } from '../ws/notifications.gateway'
import { NotificationsStudentsGateway } from '../ws/notifications_students.gateway'

@Injectable()
export class WebsocketService {
    constructor(
        private userService: UserService,
        private readonly notificationGGlobal: NotificationsGateway,
        private readonly notificationGStudent: NotificationsStudentsGateway,
        @InjectModel(Notification.name)
        private notificationModel: Model<Notification>,
        @InjectModel(NotificationsUser.name)
        private notificationsUserModel: Model<NotificationsUser>,
        @Inject('NATS_CLIENT') private natsClient: ClientProxy,
    ) {}

    async getNotificationByID(idNotification: string) {
        return await this.notificationsUserModel.findById(idNotification)
    }

    async getNotifications(idUser: string, total = false, skip = 0) {
        const notifications = await this.notificationsUserModel
            .find({ user: idUser }, { user: 0 })
            .skip(skip)
            .sort({ date: -1 })
            .limit(10)
            .populate({
                path: 'notification',
                populate: {
                    path: 'subject',
                    select: 'subject',
                },
            })
            .exec()
        let totalNot: number
        if (notifications.length == 0) {
            return {
                notifications,
                total: 0,
            }
        }
        const toGetImages = notifications
            .map((notification, i) => {
                return {
                    notification: notification.notification,
                    index: i,
                }
            })
            .filter((notification) => {
                const notificationData =
                    notification.notification as Notification
                if (notificationData?.img) return notification
            })
        const notificationsData = notifications.map((notification) => {
            const notificationAttr = notification.notification as Notification
            const notificationData = {
                _id: notification._id,
                date: notificationAttr.date,
                notification: {
                    title: notificationAttr.title,
                    url: notificationAttr.url,
                    type: notificationAttr.type,
                } as Notification,
            }
            if (notificationAttr.type === 'classroom') {
                notificationData.notification.subject = notificationAttr.subject
                notificationData.notification.type_classroom =
                    notificationAttr.type_classroom
            }
            return notificationData
        })
        if (toGetImages.length > 0) {
            const urls: Array<string> = await lastValueFrom(
                this.natsClient.send(
                    'get_aws_token_access',
                    toGetImages.map((notification) => {
                        const { img } =
                            notification.notification as Notification
                        return img
                    }),
                ),
            )
            toGetImages.forEach((notification, i) => {
                notificationsData[notification.index].notification.img = urls[i]
            })
        }
        if (total) {
            totalNot = await this.notificationsUserModel
                .find({ user: idUser })
                .count()
                .exec()
        }
        // Update status notifications
        this.notificationsUserModel
            .updateMany(
                {
                    readed: false,
                    user: idUser,
                },
                { $set: { readed: true } },
                { new: true },
            )
            .exec()
        return {
            notifications: notificationsData,
            total: totalNot,
        }
    }

    async getCountNotifications(idUser: string) {
        return await this.notificationsUserModel
            .count({
                user: idUser,
                readed: false,
            })
            .limit(100)
            .exec()
    }

    async insertNotification(notification: NotifyGlobal) {
        const date = new Date()
        const newNotification = new this.notificationModel({
            title: notification.Title,
            url: notification.Link,
            img: notification?.Img,
            type: 'global',
            date,
        })
        return await newNotification.save()
    }

    async insertNotificationClassroom(notification: NotifyClassroom) {
        const date = new Date()
        const newNotification = new this.notificationModel({
            title: notification.Title,
            url: notification.Link,
            subject: notification.Where,
            type: 'classroom',
            type_classroom: notification.Type,
            date,
        })
        return await newNotification.save()
    }

    async saveNotificationGlobal(data: NotifyGlobal) {
        const users = await this.userService.getUsers()
        const notification = await this.insertNotification(data)
        const date = new Date()
        const notifications = users.map((user) => {
            return {
                user: user._id.toString(),
                notification: notification._id.toString(),
                date,
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

    async saveNotificationClassroom(data: NotifyClassroom) {
        const students: Array<Student & { _id: string }> = await lastValueFrom(
            this.natsClient.send('get_students_by_course', data.Room),
        )
        const notification = await this.insertNotificationClassroom(data)
        const date = new Date()
        const notifications = students.map((student) => {
            return {
                user: student.user._id,
                notification: notification._id.toString(),
                date,
            }
        })
        const notificationsData = await this.notificationsUserModel.insertMany(
            notifications,
        )
        return notificationsData
    }

    async saveNotificationClassroomStudent(
        data: NotifyClassroom,
        idUser: string,
    ) {
        const notification = await this.insertNotificationClassroom(data)
        const date = new Date()
        const newNotification = new this.notificationsUserModel({
            date,
            notification: notification._id.toString(),
            user: idUser,
        })
        return await newNotification.save()
    }

    notifyGlobal() {
        this.notificationGGlobal.emitNotificationsBradcast('notify')
    }

    notifyStudents() {
        this.notificationGStudent.emitNotificationsBradcast('notify')
    }

    notifyClassroom(room: string) {
        this.notificationGStudent.emitNotificationsRoom(room, 'notify')
    }

    notifyStudent(idUser: string) {
        this.notificationGStudent.emitNotificationToUser(idUser, 'notify')
    }

    async deleteNotifiaction(idUser: string, idNotification: string) {
        const notification = await this.getNotificationByID(idNotification)
        if (!notification)
            throw new NotFoundException('No existe esta notificación')
        if (notification.user.toString() !== idUser)
            throw new UnauthorizedException('La notificación no le pertenece')
        return await notification.deleteOne()
    }

    async getCourseStudent(user: PayloadToken) {
        const courses: Array<{
            IDCourse: string
            IDSubject: string
        }> = await lastValueFrom(this.natsClient.send('get_courses', user))
        if (courses.length > 0) return courses[0].IDCourse
        return null
    }

    async deleteAllNotification(idNotification: string) {
        this.notificationModel.findByIdAndDelete(idNotification).exec()
        this.notificationsUserModel
            .deleteMany({
                notification: idNotification,
            })
            .exec()
    }
}
