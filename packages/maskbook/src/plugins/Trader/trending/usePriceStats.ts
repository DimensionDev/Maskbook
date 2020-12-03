import { useAsync } from 'react-use'
import type { Currency, DataProvider } from '../types'
import { isUndefined } from 'lodash-es'
import { Days } from '../UI/trending/PriceChartDaysControl'
import { PluginTraderRPC } from '../messages'

interface Options {
    coinId?: string
    currency?: Currency
    days?: Days
    dataProvider?: DataProvider
}

export function usePriceStats({ coinId, currency, days = Days.MAX, dataProvider }: Options) {
    return useAsync(async () => {
        if (isUndefined(days) || isUndefined(coinId) || isUndefined(dataProvider) || isUndefined(currency)) return []
        return PluginTraderRPC.getPriceStats(coinId, dataProvider, currency, days)
    }, [coinId, dataProvider, currency?.id, days])
}
