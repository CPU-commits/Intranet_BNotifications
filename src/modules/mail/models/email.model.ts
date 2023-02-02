import { EmailTemplates } from './templates.model'

export interface Email<T> {
    to: string
    subject: string
    // To is IDUser or email
    isIdUser?: boolean
    text?: string
    template?: keyof typeof EmailTemplates
    templateProps?: T
    html?: string
}
