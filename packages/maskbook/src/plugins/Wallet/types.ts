import type { CurrencyType } from '../../web3/types'

export interface GasPrice {
    title: string
    description?: string
    gasPrice: string
    wait: number
    estimated?: Record<keyof CurrencyType, string>
}
