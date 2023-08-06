import { BASE_URL } from './constants.js'
import { fetchJSON } from '../entry-helpers.js'
import type { FiatCurrencyRateBaseAPI } from '../entry-types.js'
import { CurrencyType } from '@masknet/web3-shared-base'

export class FiatCurrencyRateAPI implements FiatCurrencyRateBaseAPI.Provider {
    async getRate(type?: CurrencyType): Promise<number> {
        if (!type || type === CurrencyType.USD) return 1
        const result = await fetchJSON<FiatCurrencyRateBaseAPI.Result>(BASE_URL)
        return result.rates[type.toUpperCase()]
    }
}
