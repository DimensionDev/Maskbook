import type { PersonaIdentifier } from '@masknet/shared-base'
import { BackupPreview, generateBackupRAW, getBackupPreviewInfo } from '@masknet/backup-format'
import { createNewBackup } from './internal'

export interface MobileBackupOptions {
    noPosts?: boolean
    noWallets?: boolean
    noPersonas?: boolean
    noProfiles?: boolean
    hasPrivateKeyOnly?: boolean
}
export async function mobile_generateBackupJSON(options: MobileBackupOptions): Promise<unknown> {
    if (process.env.architecture !== 'app') throw new TypeError('This function is only available in app environment')
    const { hasPrivateKeyOnly, noPersonas, noPosts, noProfiles, noWallets } = options
    const backup = await createNewBackup({
        hasPrivateKeyOnly,
        noPersonas,
        noPosts,
        noProfiles,
        noWallets,
    })
    return generateBackupRAW(backup)
}
export async function mobile_generateBackupJSONOnlyForPersona(persona: PersonaIdentifier): Promise<unknown> {
    if (process.env.architecture !== 'app') throw new TypeError('This function is only available in app environment')
    const backup = await createNewBackup({
        noPosts: true,
        noWallets: true,
        onlyForPersona: persona,
    })
    return generateBackupRAW(backup)
}

export async function generateBackupPreviewInfo(): Promise<BackupPreview> {
    // can we avoid create a full backup?
    const backup = await createNewBackup({})
    return getBackupPreviewInfo(backup)
}

export interface BackupOptions {
    excludeWallet?: boolean
    /** Includes persona, relations, posts and profiles. */
    excludeBase?: boolean
}
export async function createBackupFile(options: BackupOptions): Promise<{ file: unknown; personaNickNames: string[] }> {
    const { excludeBase, excludeWallet } = options
    const backup = await createNewBackup({
        noPersonas: excludeBase,
        noPosts: excludeBase,
        noProfiles: excludeBase,
        noWallets: excludeWallet,
    })
    const file = generateBackupRAW(backup)
    const personaNickNames = [...backup.personas.values()].map((p) => p.nickname.unwrapOr('')).filter((x) => x)
    return { file, personaNickNames }
}
