import { FiatCurrencyRate } from '@masknet/web3-providers'

import { useAsyncRetry } from 'react-use'
import { useFiatCurrencyType } from './useFiatCurrencyType.js'

export function useFiatCurrencyRate() {
    const fiatCurrencyType = useFiatCurrencyType()
    return useAsyncRetry(async () => FiatCurrencyRate.getRate(fiatCurrencyType), [fiatCurrencyType])
}
