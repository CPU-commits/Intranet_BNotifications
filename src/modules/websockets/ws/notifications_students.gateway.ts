import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    WebSocketGateway,
    WebSocketServer,
    WsException,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { Role } from 'src/auth/models/roles.model'
import { WebsocketService } from '../service/websocket.service'
import { PayloadToken } from 'src/auth/models/token.model'
import { UserService } from 'src/modules/user/service/user.service'
import { forwardRef, Inject } from '@nestjs/common'

@WebSocketGateway({ cors: '*', namespace: '/students' })
export class NotificationsStudentsGateway
    implements OnGatewayConnection, OnGatewayDisconnect
{
    constructor(
        private readonly userService: UserService,
        @Inject(forwardRef(() => WebsocketService))
        private readonly wsService: WebsocketService,
    ) {}
    @WebSocketServer()
    server: Server

    clients: Array<{
        id: string
        idUser: string
    }> = []

    handleConnection(client: Socket) {
        if (!client.handshake.auth) new WsException('Authorization required')
        const isAuth = this.userService.jwtValidation(
            client.handshake.headers.authorization,
        )
        if (!isAuth.success) new WsException('Not auth')
        const user = isAuth.user as PayloadToken
        if (
            user.user_type !== Role.STUDENT &&
            user.user_type !== Role.STUDENT_DIRECTIVE
        )
            new WsException('Students only')
        // Add client
        this.clients.push({
            id: client.id,
            idUser: user._id,
        })
        this.joinCourseRoom(user, client)
    }

    handleDisconnect(client: Socket) {
        const index = this.clients.findIndex((c) => c.id === client.id)
        this.clients.splice(index, 1)
    }

    async joinCourseRoom(user: PayloadToken, client: Socket) {
        const course = await this.wsService.getCourseStudent(user)
        if (course) client.join(course)
    }

    emitNotificationsRoom(room: string, data: any) {
        this.server.to(room).emit('notify/students', data)
    }

    emitNotificationsBradcast(data: any) {
        this.server.emit('notify/students', data)
    }

    emitNotificationToUser(idUser: string, data: any) {
        const idsClient = this.clients.filter((client) => {
            if (client.idUser === idUser) return client
        })
        if (idsClient.length > 0) {
            idsClient.forEach((client) => {
                this.server.to(client.id).emit('notify/students', data)
            })
        }
    }
}
