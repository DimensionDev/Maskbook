import type { WalletRecord, ManagedWalletRecord } from '../../../../../plugins/Wallet/database/types'
import type { BackupJSONFileLatest } from '../latest'
import { keyToJWK, keyToAddr } from '../../../SECP256k1-ETH'
import { isSameAddr } from '../../../../../plugins/Wallet/token'

type WalletBackup = BackupJSONFileLatest['wallets'][0]

export function WalletRecordToJSONFormat(wallet: WalletRecord): WalletBackup {
    const json: Partial<WalletBackup> = {
        name: wallet.name ?? '',
        address: wallet.address,
        createdAt: wallet.createdAt.getTime(),
        updatedAt: wallet.updatedAt.getTime(),
    }

    // generate keys for managed wallet
    try {
        const wallet_ = wallet as ManagedWalletRecord
        json.passphrase = wallet_.passphrase
        if (wallet_.mnemonic?.length)
            json.mnemonic = {
                words: wallet_.mnemonic.join(' '),
                parameter: {
                    path: "m/44'/60'/0'/0/0",
                    withPassword: false,
                },
            }
        if (wallet_._public_key_ && isSameAddr(keyToAddr(wallet_._public_key_, 'public'), wallet.address))
            json.publicKey = keyToJWK(wallet_._public_key_, 'public')
        if (wallet_._private_key_ && isSameAddr(keyToAddr(wallet_._private_key_, 'private'), wallet.address))
            json.privateKey = keyToJWK(wallet_._private_key_, 'private')
    } catch (e) {
        console.error(e)
    }
    return json as WalletBackup
}

export function WalletRecordFromJSONFormat(wallet: WalletBackup): WalletRecord {
    const record: Partial<WalletRecord> = {
        name: wallet.name,
        address: wallet.address,
        createdAt: new Date(wallet.createdAt),
        updatedAt: new Date(wallet.updatedAt),
    }
    const record_ = record as ManagedWalletRecord
    return record_
}
