import { omit } from 'lodash-es'
import type { BackupJSONFileLatest } from '../latest'
import type { WalletRecord } from '../../../../../plugins/Wallet/services/wallet/type'
import { JWKToKey } from '../../..'

type WalletBackup = BackupJSONFileLatest['wallets'][0]

export function WalletRecordToJSONFormat(wallet: WalletRecord): WalletBackup {
    return {
        ...omit(
            wallet,
            'id',
            'type',
            'erc20_token_whitelist',
            'erc20_token_blacklist',
            'erc721_token_whitelist',
            'erc721_token_blacklist',
            'erc1155_token_whitelist',
            'erc1155_token_blacklist',
        ),
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
