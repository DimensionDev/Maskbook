import { Result } from 'ts-results-es'
import { compact, omit } from 'lodash-es'
import { v4 as uuid } from 'uuid'
import * as bip39 from 'bip39'
import { decodeArrayBuffer, unreachable } from '@masknet/kit'
import { type BackupSummary, getBackupSummary, normalizeBackup, type NormalizedBackup } from '@masknet/backup-format'
import {
    type EC_Private_JsonWebKey,
    type EC_Public_JsonWebKey,
    fromBase64URL,
    isEC_Private_JsonWebKey,
    PopupRoutes,
    ECKeyIdentifier,
} from '@masknet/shared-base'
import { openPopupWindow } from '../helper/popup-opener.js'
import { requestHostPermission } from '../helper/request-permission.js'
import { restoreNormalizedBackup } from './internal_restore.js'
import { bufferToHex, privateToPublic, publicToAddress } from '@ethereumjs/util'
import { SmartPayBundler, SmartPayOwner } from '@masknet/web3-providers'
import { recover_ECDH_256k1_KeyPair_ByMnemonicWord } from '../identity/persona/utils.js'
import { decode } from '@msgpack/msgpack'

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
    countOfSmartPay?: number
}

export async function restoreUnconfirmedBackup({
    id,
    action,
    countOfSmartPay,
}: RestoreUnconfirmedBackupOptions): Promise<void> {
    const backup = unconfirmedBackup.get(id)
    if (!backup) throw new Error('Backup not found')

    const granted = await requestHostPermission(backup.settings.grantedHostPermissions)
    if (!granted) return

    if (action === 'confirm') await restoreNormalizedBackup(backup, countOfSmartPay)
    else if (action === 'wallet') await openPopupWindow(PopupRoutes.WalletRecovered, { backupId: id })
    else unreachable(action)
}

export async function addUnconfirmedPersonaRestore({
    mnemonic,
    privateKeyString,
    personaName,
}: {
    mnemonic?: string
    privateKeyString?: string
    personaName: string
}) {
    let publicKey: EC_Public_JsonWebKey
    let privateKey: EC_Private_JsonWebKey

    if (mnemonic) {
        const verified = bip39.validateMnemonic(mnemonic)
        if (!verified) throw new Error('Verify error')
        const { key } = await recover_ECDH_256k1_KeyPair_ByMnemonicWord(mnemonic, '')

        publicKey = key.publicKey
        privateKey = key.privateKey
    } else if (privateKeyString) {
        const result = decode(decodeArrayBuffer(privateKeyString))
        if (!isEC_Private_JsonWebKey(result) || !result.d) throw new TypeError('Invalid private key')

        publicKey = omit(result, 'd') as EC_Public_JsonWebKey
        privateKey = result
    } else return

    if (!privateKey.d) return

    const identifier = (await ECKeyIdentifier.fromJsonWebKey(publicKey)).unwrap()
    const backupInfo = await addUnconfirmedBackup(
        JSON.stringify({
            _meta_: {
                maskbookVersion: '',
                createdAt: null,
                type: 'maskbook-backup',
                version: 2,
            },
            personas: [
                {
                    address: bufferToHex(publicToAddress(privateToPublic(Buffer.from(fromBase64URL(privateKey.d))))),
                    privateKey,
                    identifier,
                    publicKeyHex: identifier.publicKeyAsHex,
                    publicKey,
                    linkedProfiles: [],
                    nickname: personaName,
                },
            ],
            posts: [],
            profiles: [],
            relations: [],
            wallets: [],
            userGroups: [],
            grantedHostPermissions: [],
            plugin: [],
        }),
    )
    if (backupInfo.ok) {
        await openPopupWindow(PopupRoutes.WalletRecovered, { backupId: backupInfo.val.id })
    }
}

export async function addUnconfirmedBackup(raw: string): Promise<
    Result<
        {
            info: BackupSummary
            id: string
        },
        unknown
    >
> {
    return Result.wrapAsync(async () => {
        const backupObj: unknown = JSON.parse(raw)
        const backup = await normalizeBackup(backupObj)
        const summary = getBackupSummary(backup)
        const id = uuid()
        unconfirmedBackup.set(id, backup)
        return { info: summary, id }
    })
}

export async function getUnconfirmedBackup(id: string): Promise<
    | undefined
    | {
          wallets: Array<{
              address: string
              name: string
              isSmartPay?: boolean
          }>
      }
> {
    if (!unconfirmedBackup.has(id)) return undefined
    const backup = unconfirmedBackup.get(id)!
    const wallets = backup.wallets.map((x) => ({ address: x.address, name: x.name }))
    try {
        const personaAddresses = compact(
            [...backup.personas.values()].map((x) => {
                if (x.privateKey.some) {
                    const privateKey = x.privateKey.val
                    if (!privateKey.d) return
                    return bufferToHex(publicToAddress(privateToPublic(Buffer.from(fromBase64URL(privateKey.d)))))
                }
                if (x.address.some) return x.address.val
                return
            }),
        )

        const chainId = await SmartPayBundler.getSupportedChainId()
        const smartPayAccounts = await SmartPayOwner.getAccountsByOwners(chainId, [
            ...wallets.map((x) => x.address),
            ...personaAddresses,
        ])
        return {
            wallets: [
                ...wallets,
                ...smartPayAccounts
                    .filter((x) => x.funded || x.deployed)
                    .map((x, index) => ({ address: x.address, name: `Smart Pay ${index + 1}`, isSmartPay: true })),
            ],
        }
    } catch {
        return { wallets }
    }
}
