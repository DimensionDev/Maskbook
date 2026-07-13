import { getBackupSummary, normalizeBackup, type BackupSummary } from '@masknet/backup-format'
import { restoreNormalizedBackup } from './internal_restore.js'
import { Result } from 'ts-results-es'
import { sum } from 'lodash-es'

export async function generateBackupSummary(raw: string) {
    return Result.wrapAsync(async (): Promise<BackupSummary> => {
        const backupObj: unknown = JSON.parse(raw)
        const backup = await normalizeBackup(backupObj)
        const wallets = backup.wallets.map((x) => x.address)

        return {
            ...getBackupSummary(backup),
            countOfWallets: sum([wallets.length]),
        }
    })
}

export async function restoreBackup(raw: string) {
    const backupObj: unknown = JSON.parse(raw)
    const backup = await normalizeBackup(backupObj)
    await restoreNormalizedBackup(backup)
}
