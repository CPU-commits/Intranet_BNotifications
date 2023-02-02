import { Type } from 'class-transformer'
import { IsBoolean, IsNotEmpty, ValidateNested } from 'class-validator'

class AppPreferences {
    @IsBoolean()
    @IsNotEmpty()
    globals: boolean

    @IsBoolean()
    @IsNotEmpty()
    classroom: boolean

    @IsBoolean()
    @IsNotEmpty()
    customs: boolean
}

export class NotificationPreferenceDTO {
    @IsNotEmpty()
    @ValidateNested()
    @Type(() => AppPreferences)
    app: AppPreferences
}
