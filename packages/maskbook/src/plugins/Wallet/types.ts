import type { CurrencyType } from '../../web3/types'

export interface GasPrice {
    title: string
    description?: string
    gasPrice: string
    wait: number
    usd?: string
    eth?: string
    estimated?: {
        [key in CurrencyType]: string
    }
}
