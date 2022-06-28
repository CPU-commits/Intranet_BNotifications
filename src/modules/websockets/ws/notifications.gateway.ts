import { Logger } from '@nestjs/common'
import {
    OnGatewayConnection,
    OnGatewayInit,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
    WsException,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { UserService } from 'src/modules/user/service/user.service'

@WebSocketGateway({ cors: '*' })
export class NotificationsGateway
    implements OnGatewayInit, OnGatewayConnection
{
    @WebSocketServer()
    server: Server

    private logger: Logger = new Logger('AppGateway')

    constructor(private userService: UserService) {}

    afterInit() {
        this.logger.log('Initialized AppGateway')
    }

    handleConnection(client: Socket) {
        if (!client.handshake.auth) new WsException('Authorization required')
        const isAuth = this.userService.jwtValidation(
            client.handshake.headers.authorization,
        )
        if (!isAuth.success) new WsException('Not auth')
    }

    emitNotificationsBradcast(data: any) {
        this.server.emit('notify/global', data)
    }

    @SubscribeMessage('notify/students')
    hadnleEvent() {
        console.log('fg')
    }
}
