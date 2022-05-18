import { unreachable } from '@dimensiondev/kit'
import { BackupPreview, getBackupPreviewInfo, normalizeBackup, NormalizedBackup } from '@masknet/backup-format'
import { PopupRoutes } from '@masknet/shared-base'
import { Result } from 'ts-results'
import { v4 as uuid } from 'uuid'
import { openPopupWindow } from '../helper/popup-opener'
import { requestHostPermission } from '../helper/request-permission'
import { restoreNormalizedBackup } from './internal_restore'

const unconfirmedBackup = new Map<string, NormalizedBackup.Data>()
export interface RestoreUnconfirmedBackupOptions {
    /** The backup ID */
    id: string
    /**
     * Action after permission granted.
     * "confirm" to restore the backup.
     * "wallet" to open the wallet popup to restore the wallet first.
     */
    action: 'confirm' | 'wallet'
}

export async function restoreUnconfirmedBackup({ id, action }: RestoreUnconfirmedBackupOptions): Promise<void> {
    const backup = unconfirmedBackup.get(id)
    if (!backup) throw new Error('Backup not found')

    const granted = await requestHostPermission(backup.settings.grantedHostPermissions)
    if (!granted) return

    if (action === 'confirm') await restoreNormalizedBackup(backup)
    else if (action === 'wallet') await openPopupWindow(PopupRoutes.WalletRecovered, { backupId: id })
    else unreachable(action)
}

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
): Promise<undefined | { wallets: Array<{ address: string; name: string }> }> {
    if (!unconfirmedBackup.has(id)) return undefined
    const backup = unconfirmedBackup.get(id)!
    return {
        wallets: backup.wallets.map((x) => ({ address: x.address, name: x.name })),
    }
}
