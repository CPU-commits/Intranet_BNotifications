import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Subject, SubjectSchema } from './entities/subject.entity'
import { User, UserSchema } from './entities/user.entity'
import { UserService } from './service/user.service'

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: User.name,
                schema: UserSchema,
            },
            {
                name: Subject.name,
                schema: SubjectSchema,
            },
        ]),
    ],
    providers: [UserService],
    exports: [UserService],
})
export class UserModule {}
