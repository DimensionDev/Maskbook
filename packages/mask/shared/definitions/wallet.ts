import type { api } from '@dimensiondev/mask-wallet-core/proto'
import type { SourceType } from '@masknet/shared-base'

export interface WalletRecord {
    id: string
    /** User define wallet name. Default address.prefix(6) */
    name: string
    /** The address of wallet */
    address: string
    type: 'wallet'
    derivationPath?: string
    latestDerivationPath?: string
    storedKeyInfo?: api.IStoredKeyInfo
    source: SourceType
    createdAt: Date
    updatedAt: Date
}
