export enum Type {
    'global',
    'student',
}

export enum TypeClassroom {
    'publication',
    'work',
    'grade',
}

export type NotifyGlobal = {
    Title: string
    Link: string
    Img?: string
    Type: keyof typeof Type
}

export type NotifyClassroom = {
    Title: string
    Link: string
    Where: string
    Room: string
    Type: keyof typeof TypeClassroom
}
