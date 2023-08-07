import { FiatCurrencyRate } from '@masknet/web3-providers'

import { useAsyncRetry } from 'react-use'
import { useCurrencyType } from './useCurrencyType.js'

export function useFiatCurrencyRate() {
    const fiatCurrencyType = useCurrencyType()
    return useAsyncRetry(async () => FiatCurrencyRate.getRate(fiatCurrencyType), [fiatCurrencyType])
}
