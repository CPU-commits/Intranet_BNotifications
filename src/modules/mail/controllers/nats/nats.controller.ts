import { Controller, Inject } from '@nestjs/common'
import { ConfigType } from '@nestjs/config'
import { EventPattern, Payload } from '@nestjs/microservices'
import config from 'src/config'
import { Email } from '../../models/email.model'
import { RecoverPasswordTemplate } from '../../models/templates/recover_password.model'
import { MailService } from '../../services/mail/mail.service'

@Controller('nats')
export class NatsController {
    constructor(
        private readonly emailService: MailService,
        @Inject(config.KEY)
        private readonly configService: ConfigType<typeof config>,
    ) {}

    @EventPattern('imail/send')
    sendEmail(@Payload() emailData: Email<RecoverPasswordTemplate>) {
        // Inject server and college name
        emailData.templateProps['{{ BACKEND_DOMAIN }}'] =
            this.configService.backed_domain
        emailData.templateProps['{{ COLLEGE_NAME }}'] =
            this.configService.collge_name
        // Send email
        this.emailService.sendEmail(emailData)
    }
}
