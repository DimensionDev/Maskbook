import type { api } from '@dimensiondev/mask-wallet-core/proto'

export interface WalletRecord {
    type: 'wallet'
    id: string
    /** User define wallet name. Default address.prefix(6) */
    name: string
    /** The address of wallet */
    address: string
    /** The initial derivation path of mnemonic words or private keys  */
    derivationPath?: string
    /** the latest local derivation path of mnemonic words */
    latestDerivationPath?: string
    /** Mask Wallet key info */
    storedKeyInfo?: api.IStoredKeyInfo
    createdAt: Date
    updatedAt: Date
}
