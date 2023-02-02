import { Module } from '@nestjs/common'
import { ConfigType } from '@nestjs/config'
import { ClientsModule, Transport } from '@nestjs/microservices'
import config from 'src/config'
import { MailService } from './services/mail/mail.service'
import { NatsController } from './controllers/nats/nats.controller'

@Module({
    imports: [
        ClientsModule.registerAsync([
            {
                name: 'NATS_CLIENT',
                inject: [config.KEY],
                useFactory: (configService: ConfigType<typeof config>) => {
                    return {
                        transport: Transport.NATS,
                        options: {
                            servers: [`nats://${configService.nats}:4222`],
                        },
                    }
                },
            },
        ]),
    ],
    providers: [MailService],
    exports: [MailService],
    controllers: [NatsController],
})
export class MailModule {}
