import type { PersonaIdentifier } from '@masknet/shared-base'
import { BackupPreview, createEmptyNormalizedBackup, generateBackupRAW } from '@masknet/backup-format'

export interface MobileBackupOptions {
    noPosts?: boolean
    noWallets?: boolean
    noPersonas?: boolean
    noProfiles?: boolean
    hasPrivateKeyOnly?: boolean
}
export async function mobile_generateBackupJSON(options: MobileBackupOptions): Promise<unknown> {
    if (process.env.architecture !== 'app') throw new TypeError('This function is only available in app environment')
    const file = createEmptyNormalizedBackup()
    return generateBackupRAW(file)
}
export async function mobile_generateBackupJSONOnlyForPersona(persona: PersonaIdentifier): Promise<unknown> {
    if (process.env.architecture !== 'app') throw new TypeError('This function is only available in app environment')
    throw new TypeError('Not implemented')
}

export async function generateBackupPreviewInfo(): Promise<BackupPreview> {
    throw new TypeError('Not implemented')
}

export interface BackupOptions {
    excludeWallet?: boolean
    /** Includes persona, relations, posts and profiles. */
    excludeBase?: boolean
}
export async function createBackupFile(options: BackupOptions): Promise<{ file: unknown; personaNickNames: string[] }> {
    throw new TypeError('Not implemented')
}
