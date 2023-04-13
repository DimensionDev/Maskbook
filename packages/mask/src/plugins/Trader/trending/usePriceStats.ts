import { useAsyncRetry } from 'react-use'
import { isUndefined } from 'lodash-es'
import type { SourceType } from '@masknet/web3-shared-base'
import { useChainContext } from '@masknet/web3-hooks-base'
import type { NetworkPluginID } from '@masknet/shared-base'
import { TrendingAPI } from '@masknet/web3-providers/types'
import type { ChainId } from '@masknet/web3-shared-evm'
import { PluginTraderRPC } from '../messages.js'
import type { Currency } from '../types/index.js'

interface Options {
    chainId: ChainId
    coinId?: string
    currency?: Currency
    days?: TrendingAPI.Days
    dataProvider?: SourceType
}

export function usePriceStats({
    chainId: expectedChainId,
    coinId,
    currency,
    days = TrendingAPI.Days.MAX,
    dataProvider,
}: Options) {
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>({
        chainId: expectedChainId,
    })
    return useAsyncRetry(async () => {
        if (isUndefined(days) || isUndefined(coinId) || isUndefined(dataProvider) || isUndefined(currency)) return []
        return PluginTraderRPC.getPriceStats(chainId, coinId, currency, days, dataProvider)
    }, [coinId, dataProvider, currency?.id, days])
}
