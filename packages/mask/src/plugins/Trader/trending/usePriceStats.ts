import { useAsyncRetry } from 'react-use'
import type { Currency } from '../types/index.js'
import type { SourceType, NetworkPluginID } from '@masknet/web3-shared-base'
import { isUndefined } from 'lodash-es'
import { PluginTraderRPC } from '../messages.js'
import { useChainContext } from '@masknet/web3-hooks-base'
import { TrendingAPI } from '@masknet/web3-providers/types'

interface Options {
    coinId?: string
    currency?: Currency
    days?: TrendingAPI.Days
    dataProvider?: SourceType
}

export function usePriceStats({ coinId, currency, days = TrendingAPI.Days.MAX, dataProvider }: Options) {
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    return useAsyncRetry(async () => {
        if (isUndefined(days) || isUndefined(coinId) || isUndefined(dataProvider) || isUndefined(currency)) return []
        return PluginTraderRPC.getPriceStats(chainId, coinId, currency, days, dataProvider)
    }, [coinId, dataProvider, currency?.id, days])
}
