import {
    OnGatewayConnection,
    WebSocketGateway,
    WebSocketServer,
    WsException,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { Role } from 'src/auth/models/roles.model'
import { PayloadToken } from 'src/auth/models/token.model'
import { UserService } from 'src/modules/user/service/user.service'

@WebSocketGateway({ cors: '*', namespace: '/students' })
export class NotificationsStudentsGateway implements OnGatewayConnection {
    constructor(private userService: UserService) {}
    @WebSocketServer()
    server: Server

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
    }

    emitNotificationsBradcast(data: any) {
        this.server.emit('notify/students', data)
    }
}
