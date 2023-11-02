export interface BackupFileInfo {
    downloadURL: string
    size: number
    /** Timestamp in milliseconds */
    uploadedAt: number
    abstract: string
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
