import type { CurrencyType } from '@masknet/web3-shared-base'

export namespace PriceAPI {
    export interface Provider {
        getTokenPrice(platform_id: string, address: string, currency: CurrencyType): Promise<number>
        getTokensPrice(listOfAddress: string[], currency: CurrencyType): Promise<Record<string, number>>
        getTokenPriceByCoinId(coin_id: string, currency: CurrencyType): Promise<number>
    }
}
