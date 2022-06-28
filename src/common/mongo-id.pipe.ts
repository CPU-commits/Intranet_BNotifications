import {
    ArgumentMetadata,
    Injectable,
    PipeTransform,
    BadRequestException,
} from '@nestjs/common'
import { isMongoId } from 'class-validator'

@Injectable()
export class MongoIdPipe implements PipeTransform {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    transform(value: string, metadata: ArgumentMetadata) {
        if (!isMongoId(value))
            throw new BadRequestException(
                `${value} No es un ID de MongoDB válido`,
            )
        return value
    }
}
