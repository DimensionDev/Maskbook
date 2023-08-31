import { FiatCurrencyRate } from '@masknet/web3-providers'
import { useQuery } from '@tanstack/react-query'
import { useCurrencyType } from './useCurrencyType.js'

export function useFiatCurrencyRate() {
    const fiatCurrencyType = useCurrencyType()

    return useQuery({
        queryKey: ['fiat-currency-rate', fiatCurrencyType],
        queryFn: async () => FiatCurrencyRate.getRate(fiatCurrencyType),
    })
}
