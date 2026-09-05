import { type BackupSummary, generateBackupRAW, getBackupSummary } from '@masknet/backup-format'
import { createNewBackup } from './internal_create.js'
import { env } from '@masknet/flags'

export async function generateBackupPreviewInfo(): Promise<BackupSummary> {
    // can we avoid create a full backup?
    const backup = await createNewBackup({ allProfile: true, maskVersion: env.VERSION })
    return getBackupSummary(backup)
}

export interface BackupOptions {
    /** Includes persona, relations, posts and profiles. */
    excludeBase?: boolean
}
export async function createBackupFile(options: BackupOptions): Promise<{
    file: unknown
    personaNickNames: string[]
}> {
    const { excludeBase } = options
    const backup = await createNewBackup({
        noPersonas: excludeBase,
        noPosts: excludeBase,
        noProfiles: excludeBase,
        maskVersion: env.VERSION,
    })
    const file = generateBackupRAW(backup)
    const personaNickNames = backup.personas
        .values()
        .map((p) => p.nickname.unwrapOr(''))
        .filter(Boolean)
        .toArray()
    return { file, personaNickNames }
}
