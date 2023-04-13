import { useAsyncRetry } from 'react-use'
import { isUndefined } from 'lodash-es'
import type { SourceType } from '@masknet/web3-shared-base'
import { useChainContext } from '@masknet/web3-hooks-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { TrendingAPI } from '@masknet/web3-providers/types'
import { PluginTraderRPC } from '../messages.js'
import type { Currency } from '../types/index.js'

export function usePriceStats({
    chainId: expectedChainId,
    coinId,
    currency,
    days = TrendingAPI.Days.MAX,
    dataProvider,
}: {
    chainId: Web3Helper.ChainIdAll
    coinId?: string
    currency?: Currency
    days?: TrendingAPI.Days
    dataProvider?: SourceType
}) {
    const { chainId } = useChainContext({
        chainId: expectedChainId,
    })
    return useAsyncRetry(async () => {
        if (isUndefined(days) || isUndefined(coinId) || isUndefined(dataProvider) || isUndefined(currency)) return []
        return PluginTraderRPC.getPriceStats(chainId, coinId, currency, days, dataProvider)
    }, [coinId, dataProvider, currency?.id, days])
}
