import type { api } from '@dimensiondev/mask-wallet-core/proto'

export interface Wallet {
    id: string
    type: 'wallet'
    name: string
    address: string
    derivationPath: string
    storedCoin: api.Coin
    storedHash: string | null
    storedType: api.StoredKeyType | null
    storedData: Uint8Array | null
    createdAt: Date
    updatedAt: Date
}
