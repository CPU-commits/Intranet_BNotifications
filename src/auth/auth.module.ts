import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { ConfigType } from '@nestjs/config'

import config from 'src/config'
import { JwtStrategy } from './strategy/jwt.strategy'

@Module({
    imports: [
        PassportModule,
        JwtModule.registerAsync({
            inject: [config.KEY],
            useFactory: (configService: ConfigType<typeof config>) => {
                return {
                    secret: configService.jwtSecret,
                    signOptions: {
                        algorithm: 'HS256',
                        expiresIn: '3h',
                    },
                }
            },
        }),
    ],
    providers: [JwtStrategy],
})
export class AuthModule {}
