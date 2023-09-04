import type { api } from '@dimensiondev/mask-wallet-core/proto'
import type { ImportSource } from '@masknet/shared-base'

export interface WalletRecord {
    id: string
    name: string
    address: string
    source: ImportSource
    type: 'wallet'
    mnemonicId?: string
    derivationPath?: string
    latestDerivationPath?: string
    storedKeyInfo?: api.IStoredKeyInfo
    createdAt: Date
    updatedAt: Date
}
