import { BASE_URL } from './constants.js'
import { fetchJSON } from '../entry-helpers.js'
import type { FiatCurrencyRateBaseAPI } from '../entry-types.js'
import type { FiatCurrencyType } from '@masknet/web3-shared-base'

export class FiatCurrencyRateAPI implements FiatCurrencyRateBaseAPI.Provider {
    async getRate(type?: FiatCurrencyType): Promise<number> {
        if (!type) return 1
        const result = await fetchJSON<FiatCurrencyRateBaseAPI.Result>(BASE_URL)
        if (result.code !== 200) return 1
        console.log({ result })
        return 22
    }
}
