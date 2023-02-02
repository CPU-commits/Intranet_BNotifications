import { Module } from '@nestjs/common'
import { MemoryService } from './services/memory/memory.service'

@Module({
    providers: [MemoryService],
    exports: [MemoryService],
})
export class MemoryModule {}
