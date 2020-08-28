import { useEffect, useState } from 'react'
import { useAsync } from 'react-use'
import type { Platform, Currency, Settings } from '../types'
import Services from '../../../extension/service'
import { useValueRef } from '../../../utils/hooks/useValueRef'
import { getActivatedUI } from '../../../social-network/ui'
import { getCurrentTrendingViewPlatformSettings } from '../settings'

export function useCurrentCurrency(platform: Platform) {
    const [currency, setCurrency] = useState<Currency | null>(null)
    const trendingSettings = useValueRef<string>(
        getCurrentTrendingViewPlatformSettings(platform)[getActivatedUI().networkIdentifier],
    )

    // TODO:
    // support multiple currencies
    const { value: currencies = [], loading, error } = useAsync(
        () => Services.Plugin.invokePlugin('maskbook.trader', 'getLimitedCurrenies', platform),
        [platform],
    )

    useEffect(() => {
        if (!currencies.length) return
        try {
            const parsed = JSON.parse(trendingSettings || '{}') as Settings
            if (parsed.currency && currencies.some((x) => x.id === parsed.currency.id)) setCurrency(parsed.currency)
            else setCurrency(currencies[0])
        } catch (e) {
            setCurrency(null)
        }
    }, [platform, trendingSettings, currencies.map((x) => x.id).join()])

    return {
        value: loading ? null : currency,
        loading,
        error,
    }
}
