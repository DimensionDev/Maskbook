import type { api } from '@dimensiondev/mask-wallet-core/proto'
import type { Wallet } from '@masknet/web3-shared'

export interface WalletRecord extends Omit<Wallet, 'hasStoredKeyInfo' | 'hasDerivationPath'> {
    id: string
    type: 'wallet'
    derivationPath?: string
    storedKeyInfo?: api.IStoredKeyInfo
    createdAt: Date
    updatedAt: Date
}

export interface SecretRecord {
    id: string
    type: 'secret'
    iv: ArrayBuffer
    encrypted: ArrayBuffer
}
