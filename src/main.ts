import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { MicroserviceOptions, Transport } from '@nestjs/microservices'

async function bootstrap() {
    const app = await NestFactory.create(AppModule)
    // NATS Microservice
    app.connectMicroservice<MicroserviceOptions>({
        transport: Transport.NATS,
        options: {
            servers: ['nats://nats:4222'],
        },
    })
    app.enableCors({
        origin: '*',
        methods: ['GET', 'PUT', 'POST', 'DELETE'],
    })
    await app.startAllMicroservices()
    await app.listen(7000)
}
bootstrap()
