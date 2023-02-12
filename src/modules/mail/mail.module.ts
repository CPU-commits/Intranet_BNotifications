import { Module } from '@nestjs/common'
import { ClientsModule, Transport } from '@nestjs/microservices'
import { MailService } from './services/mail/mail.service'
import { NatsController } from './controllers/nats/nats.controller'
import { getNatsServers } from 'src/utils/get_nats_servers'

@Module({
    imports: [
        ClientsModule.registerAsync([
            {
                name: 'NATS_CLIENT',
                useFactory: () => {
                    return {
                        transport: Transport.NATS,
                        options: {
                            servers: getNatsServers(),
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
