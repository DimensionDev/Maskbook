import type { WalletRecord, ManagedWalletRecord } from '../../../../../plugins/Wallet/database/types'
import type { BackupJSONFileLatest } from '../latest'
import { keyToJWK, keyToAddr, JWKToKey } from '../../../SECP256k1-ETH'
import { isSameAddr } from '../../../../../plugins/Wallet/token'

type WalletBackup = BackupJSONFileLatest['wallets'][0]

export function WalletRecordToJSONFormat(wallet: WalletRecord): WalletBackup {
    const backup: Partial<WalletBackup> = {
        name: wallet.name ?? '',
        address: wallet.address,
        createdAt: wallet.createdAt.getTime(),
        updatedAt: wallet.updatedAt.getTime(),
    }

    // generate keys for managed wallet
    try {
        const wallet_ = wallet as ManagedWalletRecord
        backup.passphrase = wallet_.passphrase
        if (wallet_.mnemonic?.length)
            backup.mnemonic = {
                words: wallet_.mnemonic.join(' '),
                parameter: {
                    path: "m/44'/60'/0'/0/0",
                    withPassword: false,
                },
            }
        if (wallet_._public_key_ && isSameAddr(keyToAddr(wallet_._public_key_, 'public'), wallet.address))
            backup.publicKey = keyToJWK(wallet_._public_key_, 'public')
        if (wallet_._private_key_ && isSameAddr(keyToAddr(wallet_._private_key_, 'private'), wallet.address))
            backup.privateKey = keyToJWK(wallet_._private_key_, 'private')
    } catch (e) {
        console.error(e)
    }
    return backup as WalletBackup
}

export function WalletRecordFromJSONFormat(wallet: WalletBackup): WalletRecord {
    const record = {
        type: 'exotic',
        name: wallet.name,
        address: wallet.address,
        createdAt: new Date(wallet.createdAt),
        updatedAt: new Date(wallet.updatedAt),
    }
    if (wallet.mnemonic?.words) {
        const record_ = record as ManagedWalletRecord
        record_.type = 'managed'
        record_.passphrase = wallet.passphrase ?? ''
        record_.mnemonic = wallet.mnemonic.words.split(' ')
    }
    if (wallet.privateKey) {
        const record_ = record as ManagedWalletRecord
        record_.type = 'managed'
        record_._private_key_ = JWKToKey(wallet.privateKey, 'private')
    }
    if (wallet.publicKey) {
        const record_ = record as ManagedWalletRecord
        record_._public_key_ = JWKToKey(wallet.publicKey, 'public')
    }
    return record as WalletRecord
}
