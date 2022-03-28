import { decodeArrayBuffer, decodeText } from '@dimensiondev/kit'
import { BackupPreview, getBackupPreviewInfo, normalizeBackup, NormalizedBackup } from '@masknet/backup-format'
import { Result } from 'ts-results'
import { v4 as uuid } from 'uuid'

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

const unconfirmedBackup = new Map<string, NormalizedBackup.Data>()
export async function addUnconfirmedBackup(raw: string): Promise<Result<{ info: BackupPreview; id: string }, unknown>> {
    return Result.wrapAsync(async () => {
        const backupObj: unknown = JSON.parse(raw)
        const backup = normalizeBackup(backupObj)
        const preview = getBackupPreviewInfo(backup)
        const id = uuid()
        unconfirmedBackup.set(id, backup)
        return { info: preview, id }
    })
}

export async function getUnconfirmedBackup(
    id: string,
): Promise<undefined | { wallets: { address: string; name: string }[] }> {
    if (!unconfirmedBackup.has(id)) return undefined
    const backup = unconfirmedBackup.get(id)!
    return {
        wallets: backup.wallets.map((x) => ({ address: x.address, name: x.name })),
    }
}
