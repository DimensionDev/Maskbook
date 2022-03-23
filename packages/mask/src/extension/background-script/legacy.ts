import { isSameAddress, ProviderType } from '@masknet/web3-shared-evm'
import { exportMnemonic, exportPrivateKey, getLegacyWallets, getWallets } from '../../plugins/Wallet/services'
import { activatedPluginsWorker } from '@masknet/plugin-infra'
import { Some, None } from 'ts-results'
import { isNonNull, timeout } from '@dimensiondev/kit'
import { delegatePluginBackup, delegateWalletBackup } from '../../../background/services/backup/internal'
import type { NormalizedBackup } from '@masknet/backup-format'
import type { LegacyWalletRecord } from '../../plugins/Wallet/database/types'
import { keyToAddr, keyToJWK } from '../../utils/type-transform/SECP256k1-ETH'
import type { WalletRecord } from '../../plugins/Wallet/services/wallet/type'

delegatePluginBackup(backupAllPlugins)
delegateWalletBackup(async function () {
    const wallet = await Promise.all([backupAllWallets(), backupAllLegacyWallets()])
    return wallet.flat()
})
async function backupAllWallets(): Promise<NormalizedBackup.WalletBackup[]> {
    const allSettled = await Promise.allSettled(
        (
            await getWallets(ProviderType.MaskWallet)
        ).map(async (wallet) => {
            return {
                ...wallet,
                mnemonic: wallet.derivationPath ? await exportMnemonic(wallet.address) : undefined,
                privateKey: wallet.derivationPath ? undefined : await exportPrivateKey(wallet.address),
            }
        }),
    )
    const wallets_ = allSettled.map((x) => (x.status === 'fulfilled' ? WalletRecordToJSONFormat(x.value) : null))
    if (wallets_.some((x) => !x)) throw new Error('Failed to backup wallets.')
    return wallets_.filter(isNonNull)
}

async function backupAllLegacyWallets(): Promise<NormalizedBackup.WalletBackup[]> {
    const x = await getLegacyWallets(ProviderType.MaskWallet)
    return x.map(LegacyWalletRecordToJSONFormat)
}

export function WalletRecordToJSONFormat(
    wallet: Omit<WalletRecord, 'type'> & {
        mnemonic?: string
        privateKey?: string
    },
): NormalizedBackup.WalletBackup {
    const backup: NormalizedBackup.WalletBackup = {
        name: wallet.name ?? '',
        address: wallet.address,
        createdAt: wallet.createdAt,
        updatedAt: wallet.updatedAt,
        mnemonic: None,
        passphrase: None,
        publicKey: None,
        privateKey: None,
    }
    if (wallet.mnemonic && wallet.derivationPath) {
        backup.mnemonic = Some<NormalizedBackup.Mnemonic>({
            words: wallet.mnemonic,
            path: wallet.derivationPath,
            hasPassword: false,
        })
    }

    if (wallet.privateKey) backup.privateKey = Some(keyToJWK(wallet.privateKey, 'private'))

    return backup
}

function LegacyWalletRecordToJSONFormat(wallet: LegacyWalletRecord): NormalizedBackup.WalletBackup {
    const backup: NormalizedBackup.WalletBackup = {
        name: wallet.name ?? '',
        address: wallet.address,
        createdAt: wallet.createdAt,
        updatedAt: wallet.updatedAt,
        mnemonic: None,
        passphrase: None,
        privateKey: None,
        publicKey: None,
    }

    // generate keys for managed wallet
    try {
        const wallet_ = wallet as LegacyWalletRecord
        backup.passphrase = Some(wallet_.passphrase)
        if (wallet_.mnemonic?.length)
            backup.mnemonic = Some<NormalizedBackup.Mnemonic>({
                words: wallet_.mnemonic.join(' '),
                path: "m/44'/60'/0'/0/0",
                hasPassword: false,
            })
        if (wallet_._public_key_ && isSameAddress(keyToAddr(wallet_._public_key_, 'public'), wallet.address))
            backup.publicKey = Some(keyToJWK(wallet_._public_key_, 'public'))
        if (wallet_._private_key_ && isSameAddress(keyToAddr(wallet_._private_key_, 'private'), wallet.address))
            backup.privateKey = Some(keyToJWK(wallet_._private_key_, 'private'))
    } catch (error) {
        console.error(error)
    }
    return backup
}

async function backupAllPlugins() {
    const plugins = Object.create(null) as Record<string, unknown>
    const allPlugins = [...activatedPluginsWorker]

    async function backup(plugin: typeof allPlugins[0]): Promise<void> {
        const backupCreator = plugin.backup?.onBackup
        if (!backupCreator) return

        async function backupPlugin() {
            const result = await timeout(backupCreator!(), 3000)
            if (result.none) return
            // We limit the plugin contributed backups must be simple objects.
            // We may allow plugin to store binary if we're moving to binary backup format like MessagePack.
            plugins[plugin.ID] = result.map(JSON.stringify).map(JSON.parse).val
        }
        if (process.env.NODE_ENV === 'development') return backupPlugin()
        return backupPlugin().catch((error) =>
            console.error(`[@masknet/plugin-infra] Plugin ${plugin.ID} failed to backup`, error),
        )
    }

    await Promise.all(allPlugins.map(backup))
    return plugins
}
