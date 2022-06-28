import { Module, Global } from '@nestjs/common'
import { ConfigType } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'
import { MongoClient } from 'mongodb'

//Config
import config from '../config'

@Global()
@Module({
    providers: [
        {
            provide: 'MONGO',
            useFactory: async (configService: ConfigType<typeof config>) => {
                const { connection, host, port, dbName, user, password } =
                    configService.mongo
                const uri = `${connection}://${user}:${password}@${host}:${port}`
                const client = new MongoClient(uri)
                await client.connect()
                const database = client.db(dbName)
                return database
            },
            inject: [config.KEY],
        },
    ],
    imports: [
        MongooseModule.forRootAsync({
            useFactory: (configService: ConfigType<typeof config>) => {
                const { connection, host, port, dbName, user, password } =
                    configService.mongo
                return {
                    uri: `${connection}://${user}:${password}@${host}:${port}`,
                    dbName,
                }
            },
            inject: [config.KEY],
        }),
    ],
    exports: [MongooseModule, 'MONGO'],
})
export class DatabaseModule {}
