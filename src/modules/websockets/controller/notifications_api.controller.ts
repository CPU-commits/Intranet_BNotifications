import {
    Controller,
    Delete,
    Get,
    Param,
    Query,
    Req,
    Res,
    UseGuards,
} from '@nestjs/common'
import { Request, Response } from 'express'
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard'
import { RolesGuard } from 'src/auth/guards/roles.guard'
import { PayloadToken } from 'src/auth/models/token.model'
import { MongoIdPipe } from 'src/common/mongo-id.pipe'
import handleError from 'src/res/handleError'
import handleRes from 'src/res/handleRes'
import { WebsocketService } from '../service/websocket.service'

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/notifications')
export class NotificationsApiController {
    constructor(private notificationService: WebsocketService) {}

    @Get('/get_notifications')
    async getNotifications(
        @Res() res: Response,
        @Req() req: Request,
        @Query('skip') skip: number,
        @Query('total') total: boolean,
    ) {
        try {
            const user = req.user as PayloadToken
            const notifications =
                await this.notificationService.getNotifications(
                    user._id,
                    total,
                    skip,
                )
            handleRes(res, notifications)
        } catch (err) {
            handleError(err, res)
        }
    }

    @Delete('/delete_notification/:id')
    async deleteNotification(
        @Res() res: Response,
        @Req() req: Request,
        @Param('id', MongoIdPipe) idNotification: string,
    ) {
        try {
            const user = req.user as PayloadToken
            await this.notificationService.deleteNotifiaction(
                user._id,
                idNotification,
            )
            handleRes(res)
        } catch (err) {
            handleError(err, res)
        }
    }
}
