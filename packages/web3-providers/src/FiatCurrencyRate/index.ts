import { CurrencyType } from '@masknet/web3-shared-base'
import { fetchJSON } from '../entry-helpers.js'

const BASE_URL = 'https://nftapi.firefly.land/exchange-rates?base=USD'

export namespace FiatCurrencyRateBaseAPI {
    export type Result = {
        rates: Record<string, number>
    }
}
class FiatCurrencyRateAPI {
    async getRate(type?: CurrencyType): Promise<number> {
        if (!type || type === CurrencyType.USD) return 1
        const result = await fetchJSON<FiatCurrencyRateBaseAPI.Result>(BASE_URL)
        return result.rates[type.toUpperCase()]
    }

    async getRates() {
        const result = await fetchJSON<FiatCurrencyRateBaseAPI.Result>(BASE_URL)
        return result.rates
    }
}
export const FiatCurrencyRate = new FiatCurrencyRateAPI()
