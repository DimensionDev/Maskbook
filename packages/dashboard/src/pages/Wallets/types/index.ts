import type { CurrencyType, FungibleTokenDetailed } from '@dimensiondev/web3-shared'

export interface Asset {
    token: FungibleTokenDetailed
    /**
     * The chain name of assets
     */
    chain: 'eth' | string
    /**
     * The total balance of token
     */
    balance: string
    /**
     * The estimated price
     */
    price?: {
        [key in CurrencyType]: string
    }
    /**
     * The estimated value
     */
    value?: {
        [key in CurrencyType]: string
    }
    logoURL?: string
}
