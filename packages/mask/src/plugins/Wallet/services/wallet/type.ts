import type { api } from '@dimensiondev/mask-wallet-core/proto'
import type { Wallet } from '@masknet/web3-shared-evm'
export interface WalletRecord extends Omit<Wallet, 'configurable' | 'hasStoredKeyInfo' | 'hasDerivationPath'> {
    id: string
    type: 'wallet'
    derivationPath?: string
    latestDerivationPath?: string
    storedKeyInfo?: api.IStoredKeyInfo
    createdAt: Date
    updatedAt: Date
}

export interface SecretRecord {
    id: string
    type: 'secret'
    iv: ArrayBuffer
    key: ArrayBuffer
    encrypted: ArrayBuffer
}
