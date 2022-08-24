import { User } from './user.entity'

export class Student {
    user: User & { _id: string }
    course: string
    registration_number: string
}
