import { getBackupSummary, normalizeBackup } from '@masknet/backup-format'
import { restoreNormalizedBackup } from './internal_restore.js'
import { Result } from 'ts-results-es'
import { SmartPayBundler, SmartPayOwner } from '@masknet/web3-providers'
import { compact, sum } from 'lodash-es'
import { bytesToHex, privateToPublic, publicToAddress } from '@ethereumjs/util'
import { fromBase64URL } from '@masknet/shared-base'

export async function generateBackupSummary(raw: string) {
    return Result.wrapAsync(async () => {
        const backupObj: unknown = JSON.parse(raw)
        const backup = await normalizeBackup(backupObj)

        const personas = [...backup.personas.values()].map((x) => {
            if (!x.address.isNone()) return x.address.unwrap()
            if (x.privateKey.isNone()) return
            const privateKey = x.privateKey.unwrap()
            if (!privateKey.d) return
            const address = bytesToHex(publicToAddress(privateToPublic(fromBase64URL(privateKey.d))))

            return address
        })

        const wallets = backup.wallets.map((x) => x.address)

        const chainId = await SmartPayBundler.getSupportedChainId()
        const accounts = await SmartPayOwner.getAccountsByOwners(chainId, [...compact(personas), ...wallets])
        return {
            ...getBackupSummary(backup),
            countOfWallets: sum([accounts.filter((x) => x.deployed).length, wallets.length]),
        }
    })
}

export async function restoreBackup(raw: string) {
    const backupObj: unknown = JSON.parse(raw)
    const backup = await normalizeBackup(backupObj)
    await restoreNormalizedBackup(backup)
}
