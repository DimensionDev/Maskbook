import type { NormalizedBackup } from '@masknet/backup-format'

export interface BackupPreview {
    personas: number
    accounts: number
    posts: number
    contacts: number
    relations: number
    files: number
    wallets: number
    createdAt: number
}

export function getBackupPreviewInfo(json: NormalizedBackup.Data): BackupPreview {
    let files: number = 0

    try {
        files = Number((json.plugins?.['com.maskbook.fileservice'] as any)?.length || 0)
    } catch {}

    return {
        personas: json.personas.size,
        accounts: [...json.personas.values()].reduce((a, b) => a + b.linkedProfiles.size, 0),
        posts: json.posts.size,
        contacts: json.profiles.size,
        relations: json.relations.length,
        files,
        wallets: json.wallets.length,
        createdAt: Number(json.meta.createdAt),
    }
}
