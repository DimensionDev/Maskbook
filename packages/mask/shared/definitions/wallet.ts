import type { api } from '@dimensiondev/mask-wallet-core/proto'
import type { SourceType } from '@masknet/shared-base'

export interface WalletRecord {
    id: string
    name: string
    address: string
    source: SourceType
    type: 'wallet'
    derivationPath?: string
    latestDerivationPath?: string
    storedKeyInfo?: api.IStoredKeyInfo
    createdAt: Date
    updatedAt: Date
}
