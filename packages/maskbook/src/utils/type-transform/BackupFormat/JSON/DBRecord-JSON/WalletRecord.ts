import { omit } from 'lodash-es'
import type { BackupJSONFileLatest } from '../latest'
import type { WalletRecord } from '../../../../../plugins/Wallet/services/wallet/type'
import { JWKToKey, keyToJWK } from '../../..'

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
        privateKey: wallet.privateKey ? JWKToKey(wallet.privateKey, 'private') : undefined,
    }
}
