import { Controller, Get } from '@nestjs/common'

@Controller('main')
export class MainController {
    @Get('/healthz')
    healthz() {
        return {
            success: true,
        }
    }
}
