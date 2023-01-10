import {
    CallHandler,
    ExecutionContext,
    Inject,
    Injectable,
    Logger,
    NestInterceptor,
} from '@nestjs/common'
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston'
import { Observable } from 'rxjs'

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
    constructor(
        @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
    ) {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const rpcContext = context.switchToRpc()
        this.logger.log(`Request: ${rpcContext.getContext().args[0]}`)
        return next.handle()
    }
}
