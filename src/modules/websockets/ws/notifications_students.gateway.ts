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
import { MemoryService } from 'src/modules/memory/services/memory/memory.service'

@WebSocketGateway({ cors: '*', namespace: '/students' })
export class NotificationsStudentsGateway
    implements OnGatewayConnection, OnGatewayDisconnect
{
    @WebSocketServer()
    server: Server

    constructor(
        private readonly userService: UserService,
        @Inject(forwardRef(() => WebsocketService))
        private readonly wsService: WebsocketService,
        private readonly memoryService: MemoryService,
    ) {}

    async handleConnection(client: Socket) {
        if (!client.handshake.auth) new WsException('Authorization required')
        const isAuth = this.userService.jwtValidation(
            client.handshake.headers.authorization,
        )
        if (!isAuth.success) new WsException('Not auth')
        const user = isAuth.user as PayloadToken
        if (
            user?.user_type !== Role.STUDENT &&
            user?.user_type !== Role.STUDENT_DIRECTIVE
        )
            new WsException('Students only')
        // Add client
        await this.memoryService.set(client.id, user._id)
        this.joinCourseRoom(user, client)
    }

    async handleDisconnect(client: Socket) {
        await this.memoryService.del(client.id)
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

    async emitNotificationToUser(idUser: string, data: any) {
        const idsClient = await this.memoryService.getKeys(idUser)
        if (idsClient.length > 0) {
            idsClient.forEach((idClient) => {
                this.server.to(idClient).emit('notify/students', data)
            })
        }
    }
}
