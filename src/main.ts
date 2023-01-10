import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { MicroserviceOptions, Transport } from '@nestjs/microservices'
import helmet from 'helmet'
// import * as csruf from 'csurf'
import config from './config'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { ResApi } from './models/res.model'
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston'

async function bootstrap() {
    // Config
    const configService = config()
    // App
    const app = await NestFactory.create(AppModule)
    // Logger
    app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER))
    // NATS Microservice
    app.connectMicroservice<MicroserviceOptions>({
        transport: Transport.NATS,
        options: {
            servers: [`nats://${configService.nats}:4222`],
            queue: 'notifications',
        },
    })
    const httpClient = `http://${configService.client_url}`
    const httpsClient = `https://${configService.client_url}`
    app.enableCors({
        origin: [httpClient, httpsClient],
        methods: ['GET', 'PUT', 'POST', 'DELETE'],
        credentials: true,
    })
    // Helmet
    app.use(
        helmet({
            contentSecurityPolicy: false,
        }),
    )
    // Swagger
    const configDocs = new DocumentBuilder()
        .setTitle('Notifications API')
        .setVersion('1.0')
        .setDescription('API Server For Notifications service')
        .setTermsOfService('http://swagger.io/terms/')
        .setContact(
            'API Support',
            'http://www.swagger.io/support',
            'support@swagger.io',
        )
        .setLicense(
            'Apache 2.0',
            'http://www.apache.org/licenses/LICENSE-2.0.html',
        )
        .setBasePath('/api/l')
        .addServer('http://localhost:3000')
        .addTag('Notifications', 'Notifications Service')
        .addBearerAuth()
        .build()
    const docuement = SwaggerModule.createDocument(app, configDocs, {
        extraModels: [ResApi],
    })
    SwaggerModule.setup('/api/notifications/docs', app, docuement)
    // Csurf
    // app.use(csruf())
    await app.startAllMicroservices()
    await app.listen(7000)
}
bootstrap()
