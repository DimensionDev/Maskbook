import { CurrencyType } from '@masknet/web3-shared-base'
import { COINGECKO_URL_BASE } from '../CoinGecko/constants.js'
import { fetchCachedJSON } from '../helpers/fetchJSON.js'

// CoinGecko exchange rates are BTC-based; convert them to USD-based to keep the old shape.
interface CoinGeckoExchangeRates {
    rates: {
        [currency: string]: {
            value: number
        }
    }
}

const BASE_URL = `${COINGECKO_URL_BASE}/exchange_rates`

export namespace FiatCurrencyRateBaseAPI {
    export interface Result {
        rates: { [currency: string]: number }
    }
}

async function getExchangeRates(): Promise<FiatCurrencyRateBaseAPI.Result['rates']> {
    const result = await fetchCachedJSON<CoinGeckoExchangeRates>(BASE_URL)
    const usdValue = result.rates.usd?.value || 1
    return Object.fromEntries(
        Object.entries(result.rates).map(([code, rate]) => [code.toUpperCase(), rate.value / usdValue]),
    )
}

export const FiatCurrencyRate = {
    async getRate(type?: CurrencyType): Promise<number> {
        if (!type || type === CurrencyType.USD) return 1
        const rates = await getExchangeRates()
        return rates[type.toUpperCase()]
    },

    async getRates() {
        return getExchangeRates()
    },
}
