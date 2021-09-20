import type { api } from '@dimensiondev/mask-wallet-core/proto'

export interface Wallet {
    id: string
    type: 'wallet'
    name: string
    address: string
    derivationPath?: string
    storedKeyInfo?: api.IStoredKeyInfo
    erc20_token_whitelist: Set<string>
    erc20_token_blacklist: Set<string>
    createdAt: Date
    updatedAt: Date
}
