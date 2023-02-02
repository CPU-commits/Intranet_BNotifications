import {
    Body,
    Controller,
    Get,
    Post,
    Req,
    Res,
    UseGuards,
} from '@nestjs/common'
import { Request, Response } from 'express'
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard'
import { RolesGuard } from 'src/auth/guards/roles.guard'
import { PayloadToken } from 'src/auth/models/token.model'
import handleError from 'src/res/handleError'
import handleRes from 'src/res/handleRes'
import { NotificationPreferenceDTO } from '../../dtos/notifications_preferences.dto'
import { NotificationsService } from '../../services/notifications/notifications.service'

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/notifications')
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) {}

    @Get('/get_preferences')
    async getPreferences(@Res() res: Response, @Req() req: Request) {
        try {
            const user = req.user as PayloadToken
            const preferences = await this.notificationsService.getPreferences(
                user._id,
            )
            handleRes(res, preferences)
        } catch (err) {
            handleError(err, res)
        }
    }

    @Post('/change_preferences')
    async changePreferences(
        @Res() res: Response,
        @Req() req: Request,
        @Body() preferences: NotificationPreferenceDTO,
    ) {
        try {
            const user = req.user as PayloadToken
            await this.notificationsService.changePreferences(
                preferences,
                user._id,
            )
            handleRes(res)
        } catch (err) {
            handleError(err, res)
        }
    }
}
