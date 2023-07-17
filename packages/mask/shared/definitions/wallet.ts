import type { api } from '@dimensiondev/mask-wallet-core/proto'

export interface WalletRecord {
    id: string
    /** User define wallet name. Default address.prefix(6) */
    name: string
    /** The address of wallet */
    address: string
    type: 'wallet'
    derivationPath?: string
    latestDerivationPath?: string
    imported?: boolean
    storedKeyInfo?: api.IStoredKeyInfo
    createdAt: Date
    updatedAt: Date
}
