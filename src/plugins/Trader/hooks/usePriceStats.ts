import { useAsync } from 'react-use'
import Services from '../../../extension/service'
import type { Currency, Platform } from '../types'
import { isUndefined } from 'lodash-es'
import { Days } from '../UI/PriceChartDaysControl'

interface Options {
    coinId?: string
    currency?: Currency
    days?: Days
    platform?: Platform
}

export function usePriceStats({ coinId, currency, days = Days.MAX, platform }: Options) {
    return useAsync(async () => {
        if (isUndefined(days) || isUndefined(coinId) || isUndefined(platform) || isUndefined(currency)) return []
        return Services.Plugin.invokePlugin('maskbook.trader', 'getPriceStats', coinId, platform, currency, days)
    }, [coinId, platform, currency?.id, days])
}
