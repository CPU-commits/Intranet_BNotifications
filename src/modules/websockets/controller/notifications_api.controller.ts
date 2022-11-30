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
import {
    ApiExtraModels,
    ApiOkResponse,
    ApiOperation,
    ApiQuery,
    ApiTags,
    getSchemaPath,
} from '@nestjs/swagger'
import { Request, Response } from 'express'
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard'
import { RolesGuard } from 'src/auth/guards/roles.guard'
import { PayloadToken } from 'src/auth/models/token.model'
import { MongoIdPipe } from 'src/common/mongo-id.pipe'
import { ResApi } from 'src/models/res.model'
import handleError from 'src/res/handleError'
import handleRes from 'src/res/handleRes'
import { CountRes } from '../res/count.res'
import { NotificationsRes } from '../res/notifications.res'
import { WebsocketService } from '../service/websocket.service'

@ApiTags('roles.all', 'Notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/notifications')
export class NotificationsApiController {
    constructor(private notificationService: WebsocketService) {}

    @ApiExtraModels(CountRes)
    @ApiOperation({
        description: 'Get count notifications (not readed)',
        summary: 'Get count notifications',
    })
    @ApiOkResponse({
        schema: {
            allOf: [
                { $ref: getSchemaPath(ResApi) },
                {
                    properties: {
                        body: {
                            $ref: getSchemaPath(CountRes),
                        },
                    },
                },
            ],
        },
    })
    @Get('/get_count_notifications')
    async getCountNotifications(@Res() res: Response, @Req() req: Request) {
        try {
            const user = req.user as PayloadToken
            const notificationCount =
                await this.notificationService.getCountNotifications(user._id)
            handleRes(res, {
                count: notificationCount,
            })
        } catch (err) {
            handleError(err, res)
        }
    }

    @ApiExtraModels(NotificationsRes)
    @ApiOperation({
        description: 'Get user notifications',
        summary: 'Get notifications',
    })
    @ApiOkResponse({
        schema: {
            allOf: [
                { $ref: getSchemaPath(ResApi) },
                {
                    properties: {
                        body: {
                            $ref: getSchemaPath(NotificationsRes),
                        },
                    },
                },
            ],
        },
    })
    @ApiQuery({
        name: 'skip',
        required: false,
    })
    @ApiQuery({
        name: 'total',
        required: false,
    })
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

    @ApiOperation({
        description: 'Delete notification',
        summary: 'Delete notification',
    })
    @ApiOkResponse({
        schema: { $ref: getSchemaPath(ResApi) },
    })
    @Delete('/delete_notification/:idNotification')
    async deleteNotification(
        @Res() res: Response,
        @Req() req: Request,
        @Param('idNotification', MongoIdPipe) idNotification: string,
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
