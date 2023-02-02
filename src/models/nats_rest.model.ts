export interface NatsRes<T> {
    success: boolean
    message?: string
    data?: T
    status?: number
}
