import { ApiProperty } from '@nestjs/swagger'

export class CountRes {
    @ApiProperty({
        example: 15,
    })
    count: number
}
