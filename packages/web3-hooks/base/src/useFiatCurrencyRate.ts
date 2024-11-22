import { FiatCurrencyRate } from '@masknet/web3-providers'
import { CurrencyType } from '@masknet/web3-shared-base'
import { useQuery } from '@tanstack/react-query'
import { pick } from 'lodash-es'

export function useFiatCurrencyRate() {
    return useQuery({
        queryKey: ['@@fiat-currency-rates'],
        queryFn: async (): Promise<Record<string, number>> => {
            const allRates = await FiatCurrencyRate.getRates()
            // Pick what we need only to reduce memory cost.
            return pick(allRates, Object.keys(CurrencyType))
        },
        select: (data) => data[CurrencyType.USD],
    })
}
