import { useAsync } from 'react-use'
import Services from '../../../extension/service'
import { useCurrentCurrency } from './useCurrentCurrency'
import type { Platform } from '../type'

export function useTrending(keyword: string, platform: Platform) {
    const { value: currency, loading: loadingCurrency, error: errorCurrency } = useCurrentCurrency(platform)
    const { value: trending, loading: loadingTrending, error: errorTrending } = useAsync(async () => {
        if (!currency) return null
        return Services.Plugin.invokePlugin('maskbook.trader', 'getCoinTrendingByKeyword', keyword, platform, currency)
    }, [platform, currency, keyword])

    return {
        value: trending,
        loading: loadingCurrency || loadingTrending,
        error: errorCurrency || errorTrending,
    }
}
