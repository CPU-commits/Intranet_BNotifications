import { Inject, Injectable, Logger } from '@nestjs/common'
import { ConfigType } from '@nestjs/config'
import { ClientProxy } from '@nestjs/microservices'
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston'
import * as nodemailer from 'nodemailer'
import { MailOptions } from 'nodemailer/lib/json-transport'
import SMTPTransport from 'nodemailer/lib/smtp-transport'
import { lastValueFrom } from 'rxjs'
import config from 'src/config'
import { readFileSync } from 'fs'
import { NatsRes } from 'src/models/nats_rest.model'
import { User } from 'src/modules/user/entities/user.entity'
import { Email } from '../../models/email.model'
import { EmailTemplates } from '../../models/templates.model'
import { join } from 'path'

@Injectable()
export class MailService {
    private transporter: nodemailer.Transporter<SMTPTransport.SentMessageInfo>

    constructor(
        @Inject(config.KEY)
        private readonly configService: ConfigType<typeof config>,
        @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
        @Inject('NATS_CLIENT') private natsClient: ClientProxy,
    ) {
        this.initMailer()
    }

    private initMailer() {
        const transporter = nodemailer.createTransport({
            host: this.configService.email.smtpHost,
            port: this.configService.email.smtpPort,
            secure: this.configService.email.smtpPort === 465,
            auth: {
                user: this.configService.email.smtpUser,
                pass: this.configService.email.smtpPass,
            },
        })
        this.transporter = transporter
    }

    private convertTemplateToText(
        template: keyof typeof EmailTemplates,
        props: unknown,
    ) {
        const fileBuffer = readFileSync(
            join(__dirname, `../../templates/${template}.html`),
        )
        let fileContent = fileBuffer.toString()

        if (typeof props === 'object') {
            for (const key in props) {
                fileContent = fileContent.replace(key, props[key])
            }
        }

        return fileContent
    }

    async sendEmail(emailConfig: Email<unknown>) {
        // Log email
        this.logger.log(`Try to send email to ${emailConfig.to}`)
        // Set to
        let to: string
        if (emailConfig.isIdUser) {
            const user = await lastValueFrom<NatsRes<User>>(
                this.natsClient.send('get_user_by_id', {
                    idUser: emailConfig.to,
                }),
            )
            if (user.success && user.data?.email) to = user.data.email
            else
                this.logger.error(
                    `The email to ${emailConfig.to} could not be sent - Could not determine "to"`,
                )
        } else to = emailConfig.to
        // Set mail options
        const mailOptions: MailOptions = {
            from: this.configService.email.smtpSender,
            to,
            subject: emailConfig.subject,
        }
        if (emailConfig?.html) mailOptions.html = emailConfig.html
        if (emailConfig?.text) mailOptions.text = emailConfig.text
        if (emailConfig?.template) {
            const html = this.convertTemplateToText(
                emailConfig.template,
                emailConfig.templateProps,
            )
            mailOptions.html = html
        }
        // Try to send email
        try {
            const info = await this.transporter.sendMail(mailOptions)
            this.logger.log(
                'Message sented',
                info.messageId,
                info.accepted,
                info.rejected,
                info.pending,
                info.response,
            )
        } catch (err) {
            this.logger.error(
                `The email to ${emailConfig.to} could not be sent - Error with the SMTP Server`,
            )
        }
    }
}
