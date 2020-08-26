import { useState, useEffect } from 'react'
import { Platform, Currency, Settings } from '../type'
import { useValueRef } from '../../../utils/hooks/useValueRef'
import { currentTrendingViewSettings, currentTrendingViewPlatformSettings } from '../settings'
import { getActivatedUI } from '../../../social-network/ui'
import { useAsync } from 'react-use'
import Services from '../../../extension/service'

export function useTrending(keyword: string) {
    const [platform, setPlatform] = useState(Platform.COIN_GECKO)
    const [currency, setCurrency] = useState<Currency | null>(null)

    const networkKey = `${getActivatedUI().networkIdentifier}-${platform}`
    const trendingSettings = useValueRef<string>(currentTrendingViewSettings[networkKey])
    const trendingPlatformSettings = useValueRef<string>(currentTrendingViewPlatformSettings[networkKey])

    //#region currency & platform
    const { value: currencies = [], loading: loadingCurrencies, error: errorCurrencies } = useAsync(
        () => Services.Plugin.invokePlugin('maskbook.trader', 'getLimitedCurrenies', platform),
        [platform],
    )

    // sync platform
    useEffect(() => {
        if (String(platform) !== trendingPlatformSettings) {
            if (trendingPlatformSettings === String(Platform.COIN_GECKO)) setPlatform(Platform.COIN_GECKO)
            if (trendingPlatformSettings === String(Platform.COIN_MARKET_CAP)) setPlatform(Platform.COIN_MARKET_CAP)
        }
    }, [platform, trendingPlatformSettings])

    // sync currency
    useEffect(() => {
        if (!currencies.length) return
        try {
            const parsed = JSON.parse(trendingSettings || '{}') as Settings
            if (parsed.currency && currencies.some((x) => x.id === parsed.currency.id)) setCurrency(parsed.currency)
            else setCurrency(currencies[0])
        } catch (e) {
            setCurrency(null)
        }
    }, [trendingSettings, currencies.length])
    //#endregion

    //#region trending
    const { value: trending, loading: loadingTrending, error: errorTrending } = useAsync(async () => {
        if (!currency) return null
        return Services.Plugin.invokePlugin('maskbook.trader', 'getCoinTrendingByKeyword', keyword, platform, currency)
    }, [platform, currency, keyword])
    //#endregion

    return {
        value: trending,
        loading: loadingCurrencies || loadingTrending,
        error: errorCurrencies || errorTrending,
    }
}
