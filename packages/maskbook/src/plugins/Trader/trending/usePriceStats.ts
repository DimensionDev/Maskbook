import { useAsyncRetry } from 'react-use'
import type { Currency, DataProvider } from '../types'
import { isUndefined } from 'lodash-es'
import { PluginTraderRPC } from '../messages'
import { Days } from '../SNSAdaptor/trending/PriceChartDaysControl'

interface Options {
    coinId?: string
    currency?: Currency
    days?: Days
    dataProvider?: DataProvider
}

export function usePriceStats({ coinId, currency, days = Days.MAX, dataProvider }: Options) {
    return useAsyncRetry(async () => {
        if (isUndefined(days) || isUndefined(coinId) || isUndefined(dataProvider) || isUndefined(currency)) return []
        return PluginTraderRPC.getPriceStats(coinId, currency, days, dataProvider)
    }, [coinId, dataProvider, currency?.id, days])
}
