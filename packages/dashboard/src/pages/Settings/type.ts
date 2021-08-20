export interface BackupFileInfo {
    downloadURL: string
    size: number
    uploadedAt: number
    abstract: string
}

export type AccountValidationType = 'email' | 'phone'
