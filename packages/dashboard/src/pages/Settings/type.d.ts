interface BackupFileInfo {
    downloadURL: string
    size: number
    uploadedAt: number
    abstract: string
}

type AccountValidationType = 'email' | 'phone'
