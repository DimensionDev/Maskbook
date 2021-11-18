import { omit } from 'lodash-unified'
import type { BackupJSONFileLatest } from '../latest'
import type { WalletRecord } from '../../../../../plugins/Wallet/services/wallet/type'
import { JWKToKey, keyToAddr, keyToJWK } from '../../..'
import type { LegacyWalletRecord } from '../../../../../plugins/Wallet/database/types'
import { isSameAddress } from '@masknet/web3-shared-evm'

type WalletBackup = BackupJSONFileLatest['wallets'][0]

export function WalletRecordToJSONFormat(
    wallet: Omit<WalletRecord, 'type'> & {
        mnemonic?: string
        privateKey?: string
    },
): WalletBackup {
    return {
        ...omit(
            wallet,
            'id',
            'erc20_token_whitelist',
            'erc20_token_blacklist',
            'erc721_token_whitelist',
            'erc721_token_blacklist',
            'erc1155_token_whitelist',
            'erc1155_token_blacklist',
            'derivationPath',
            'storedKeyInfo',
        ),
        mnemonic:
            wallet.mnemonic && wallet.derivationPath
                ? {
                      words: wallet.mnemonic,
                      parameter: {
                          path: wallet.derivationPath,
                          withPassword: false,
                      },
                  }
                : undefined,
        privateKey: wallet.privateKey ? keyToJWK(wallet.privateKey, 'private') : undefined,
        createdAt: wallet.createdAt.getTime(),
        updatedAt: wallet.updatedAt.getTime(),
    }
}

export function LegacyWalletRecordToJSONFormat(wallet: LegacyWalletRecord): WalletBackup {
    const backup: Partial<WalletBackup> = {
        name: wallet.name ?? '',
        address: wallet.address,
        createdAt: wallet.createdAt.getTime(),
        updatedAt: wallet.updatedAt.getTime(),
    }

    // generate keys for managed wallet
    try {
        const wallet_ = wallet as LegacyWalletRecord
        backup.passphrase = wallet_.passphrase
        if (wallet_.mnemonic?.length)
            backup.mnemonic = {
                words: wallet_.mnemonic.join(' '),
                parameter: {
                    path: "m/44'/60'/0'/0/0",
                    withPassword: false,
                },
            }
        if (wallet_._public_key_ && isSameAddress(keyToAddr(wallet_._public_key_, 'public'), wallet.address))
            backup.publicKey = keyToJWK(wallet_._public_key_, 'public')
        if (wallet_._private_key_ && isSameAddress(keyToAddr(wallet_._private_key_, 'private'), wallet.address))
            backup.privateKey = keyToJWK(wallet_._private_key_, 'private')
    } catch (error) {
        console.error(error)
    }
    return backup as WalletBackup
}

export function WalletRecordFromJSONFormat(wallet: WalletBackup): WalletRecord & {
    mnemonic?: string
    privateKey?: string
} {
    return {
        ...omit(wallet, 'mnemonic', 'privateKey'),
        id: wallet.address,
        type: 'wallet',
        erc20_token_whitelist: new Set(),
        erc20_token_blacklist: new Set(),
        erc721_token_whitelist: new Set(),
        erc721_token_blacklist: new Set(),
        erc1155_token_whitelist: new Set(),
        erc1155_token_blacklist: new Set(),
        createdAt: new Date(wallet.createdAt),
        updatedAt: new Date(wallet.updatedAt),
        mnemonic: wallet.mnemonic?.words,
        derivationPath: wallet.mnemonic?.parameter.path,
        privateKey: wallet.privateKey ? JWKToKey(wallet.privateKey, 'private') : undefined,
    }
}
