import { FiatCurrencyRate } from '@masknet/web3-providers'
import { CurrencyType } from '@masknet/web3-shared-base'
import { useQuery } from '@tanstack/react-query'
import { pick } from 'lodash-es'
import { useCurrencyType } from './useCurrencyType.js'

// TODO create generic hook wrapping useQuery with persistent cache as placeholderData.
const STORE_KEY = '@mask/fiat-currency-rates'
const getData = () => {
    const raw = localStorage.getItem(STORE_KEY)
    if (!raw) return undefined
    try {
        return JSON.parse(raw) as Record<string, number>
    } catch {
        return undefined
    }
}

const setData = (data: Record<string, number>) => {
    localStorage.setItem(STORE_KEY, JSON.stringify(data))
}

export function useFiatCurrencyRate() {
    const fiatCurrencyType = useCurrencyType()
    const currencyType = fiatCurrencyType?.toUpperCase() || CurrencyType.USD

    return useQuery({
        queryKey: ['fiat-currency-rates'],
        placeholderData: getData(),
        queryFn: async () => {
            const allRates = await FiatCurrencyRate.getRates()
            // Pick what we need only to reduce memory cost.
            const rates = pick(allRates, Object.keys(CurrencyType))
            setData(rates)
            return rates
        },
        select: (data) => data[currencyType],
    })
}
