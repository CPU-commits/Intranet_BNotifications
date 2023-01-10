import { Logger } from '@nestjs/common'
import { Response } from 'express'
import { CORRELATION_ID_HEADER } from 'src/correlation-id.middleware'

export default function (err: any, res: Response) {
    const logger = new Logger()
    const status = err.status || 500

    logger.error(
        `Failed ${status} - ${res.getHeader(CORRELATION_ID_HEADER)} - ${
            err.message
        }`,
    )
    res.status(status).json({
        success: false,
        message: err.message,
    })
}
