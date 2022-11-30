import { ApiProperty } from '@nestjs/swagger'

export class ResApi<T> {
    @ApiProperty()
    success: boolean

    @ApiProperty({
        required: false,
        example: 'Error message',
    })
    message: string

    body: T
}
