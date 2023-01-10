import { Logger } from '@nestjs/common'
import { Response } from 'express'
import { CORRELATION_ID_HEADER } from 'src/correlation-id.middleware'

export default function (res: Response, body?: any) {
    const logger = new Logger()
    logger.log(`Success req ${res.getHeader(CORRELATION_ID_HEADER)}`)

    res.json({
        success: true,
        body,
    })
}
