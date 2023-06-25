import { type BackupPreview, generateBackupRAW, getBackupPreviewInfo } from '@masknet/backup-format'
import { createNewBackup } from './internal_create.js'
import { getBuildInfo } from '@masknet/shared-base'

const ver = getBuildInfo().then((env) => (env.VERSION === 'missing' ? undefined : env.VERSION))
export async function generateBackupPreviewInfo(): Promise<BackupPreview> {
    // can we avoid create a full backup?
    const backup = await createNewBackup({ allProfile: true, maskVersion: await ver })
    return getBackupPreviewInfo(backup)
}

export interface BackupOptions {
    excludeWallet?: boolean
    /** Includes persona, relations, posts and profiles. */
    excludeBase?: boolean
}
export async function createBackupFile(options: BackupOptions): Promise<{
    file: unknown
    personaNickNames: string[]
}> {
    const { excludeBase, excludeWallet } = options
    const backup = await createNewBackup({
        noPersonas: excludeBase,
        noPosts: excludeBase,
        noProfiles: excludeBase,
        noWallets: excludeWallet,
        maskVersion: await ver,
    })
    const file = generateBackupRAW(backup)
    const personaNickNames = [...backup.personas.values()].map((p) => p.nickname.unwrapOr('')).filter(Boolean)
    return { file, personaNickNames }
}
