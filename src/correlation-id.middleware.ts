import { Inject, Injectable, Logger, NestMiddleware } from '@nestjs/common'
import { randomUUID } from 'crypto'
import { NextFunction, Request, Response } from 'express'
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston'

export const CORRELATION_ID_HEADER = 'X-Correlation-Id'

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
    constructor(
        @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
    ) {}

    use(req: Request, res: Response, next: NextFunction) {
        const id = randomUUID()
        res.setHeader(CORRELATION_ID_HEADER, id)
        this.logger.log(`Req ${id} - ${req.baseUrl} - ${req.rawHeaders}`)
        next()
    }
}
