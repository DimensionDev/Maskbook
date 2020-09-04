import { useAsync } from 'react-use'
import Services from '../../../extension/service'
import type { Platform, Currency } from '../types'

export function useTrending(keyword: string, platform: Platform, currency: Currency | null) {
    const { value: trending, loading: loadingTrending, error: errorTrending } = useAsync(async () => {
        if (!currency) return null
        return Services.Plugin.invokePlugin('maskbook.trader', 'getCoinTrendingByKeyword', keyword, platform, currency)
    }, [platform, currency, keyword])
    return {
        value: trending,
        loading: loadingTrending,
        error: errorTrending,
    }
}
