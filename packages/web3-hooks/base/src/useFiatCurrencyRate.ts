import { FiatCurrencyRate } from '@masknet/web3-providers'
import type { FiatCurrencyType } from '@masknet/web3-shared-base'
import { useAsyncRetry } from 'react-use'

export function useFiatCurrencyRate(type?: FiatCurrencyType) {
    return useAsyncRetry(() => {
        return FiatCurrencyRate.getRate(type)
    }, [type])
}
