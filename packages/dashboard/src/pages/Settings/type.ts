export interface BackupFileInfo {
    downloadURL: string
    size: number
    uploadedAt: number
    abstract: string
}

export enum AccountType {
    email = 'email',
    phone = 'phone',
}

export enum Scenario {
    backup = 'backup',
    create = 'create_binding',
    change = 'change_binding',
}

export enum Locale {
    en = 'en',
    zh = 'zh',
}
