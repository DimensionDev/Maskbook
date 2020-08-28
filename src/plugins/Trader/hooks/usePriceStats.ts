import { useAsync } from 'react-use'
import Services from '../../../extension/service'
import type { Currency, Platform } from '../types'
import { isUndefined } from 'lodash-es'

interface Options {
    coinId?: string
    currency?: Currency
    days?: number
    platform?: Platform
}

export function usePriceStats({ coinId, currency, days = 30, platform }: Options) {
    return useAsync(async () => {
        if (days <= 0) return []
        if (isUndefined(coinId) || isUndefined(platform) || isUndefined(currency)) return []
        return Services.Plugin.invokePlugin('maskbook.trader', 'getPriceStats', coinId, platform, currency, days)
    }, [coinId, platform, currency?.id, days])
}
