interface BackupFileInfo {
    downloadURL: string
    size: number
    uploadedAt: string
    abstract: string
}

type AccountValidationType = 'email' | 'phone'
