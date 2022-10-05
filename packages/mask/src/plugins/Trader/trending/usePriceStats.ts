import { useAsyncRetry } from 'react-use'
import type { Currency } from '../types/index.js'
import type { DataProvider } from '@masknet/public-api'
import { isUndefined } from 'lodash-unified'
import { PluginTraderRPC } from '../messages.js'
import { useChainId } from '@masknet/web3-hooks-base'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { TrendingAPI } from '@masknet/web3-providers'

interface Options {
    coinId?: string
    currency?: Currency
    days?: TrendingAPI.Days
    dataProvider?: DataProvider
}

export function usePriceStats({ coinId, currency, days = TrendingAPI.Days.MAX, dataProvider }: Options) {
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    return useAsyncRetry(async () => {
        if (isUndefined(days) || isUndefined(coinId) || isUndefined(dataProvider) || isUndefined(currency)) return []
        return PluginTraderRPC.getPriceStats(chainId, coinId, currency, days, dataProvider)
    }, [coinId, dataProvider, currency?.id, days])
}
