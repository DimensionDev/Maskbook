import { useAsyncRetry } from 'react-use'
import type { Currency } from '../types/index.js'
import type { SourceType } from '@masknet/web3-shared-base'
import { isUndefined } from 'lodash-es'
import { PluginTraderRPC } from '../messages.js'
import { useChainContext } from '@masknet/web3-hooks-base'
import type { NetworkPluginID } from '@masknet/shared-base'
import { TrendingAPI } from '@masknet/web3-providers/types'
import type { Web3Helper } from '@masknet/web3-helpers'

interface Options {
    chainId: Web3Helper.ChainIdAll
    coinId?: string
    currency?: Currency
    days?: TrendingAPI.Days
    dataProvider?: SourceType
}

export function usePriceStats({
    chainId: coinChainId,
    coinId,
    currency,
    days = TrendingAPI.Days.MAX,
    dataProvider,
}: Options) {
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>({
        chainId: coinChainId,
    })
    return useAsyncRetry(async () => {
        if (isUndefined(days) || isUndefined(coinId) || isUndefined(dataProvider) || isUndefined(currency)) return []
        return PluginTraderRPC.getPriceStats(chainId, coinId, currency, days, dataProvider)
    }, [coinId, dataProvider, currency?.id, days])
}
