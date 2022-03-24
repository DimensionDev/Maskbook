import { decodeArrayBuffer, decodeText } from '@dimensiondev/kit'
import { BackupPreview, normalizeBackup, NormalizedBackup } from '@masknet/backup-format'

/**
 * Only for mobile. Throw when no Persona is restored
 */
export async function mobile_restoreFromBase64(rawString: string): Promise<void> {
    if (process.env.architecture !== 'app') throw new Error('Only for mobile')

    const raw = JSON.parse(decodeText(decodeArrayBuffer(rawString)))
    const backup = normalizeBackup(raw)
    // restore backup
    throw new TypeError('Not implemented')
}

/**
 * Only for mobile. Throw when no Persona is restored.
 */
export async function mobile_restoreFromBackup(rawString: string): Promise<void> {
    if (process.env.architecture !== 'app') throw new Error('Only for mobile')

    const backup = normalizeBackup(JSON.parse(rawString))
    // restore backup
    throw new TypeError('Not implemented')
}

/**
 * Throw when no Persona is restored.
 */
export async function restoreBackup(backup: string): Promise<void> {
    throw new TypeError('Not implemented')
}

export async function restoreBackupWithID({ id }: { id: string }): Promise<void> {}
export async function restoreBackupWithIDAndPermission({ id }: { id: string }): Promise<void> {}
export async function restoreBackupWithIDAndPermissionAndWallet({ id }: { id: string }): Promise<void> {}

export async function parseBackupStr(backup: string): Promise<{ info: BackupPreview; id: string }> {
    throw new TypeError('Not implemented')
}

export async function getUnconfirmedBackup(id: string): Promise<{ wallets: NormalizedBackup.WalletBackup[] }> {
    throw new TypeError('Not implemented')
}
