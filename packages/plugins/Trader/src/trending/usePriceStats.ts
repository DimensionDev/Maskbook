import { isUndefined } from 'lodash-es'
import { Days, EMPTY_LIST } from '@masknet/shared-base'
import type { SourceType } from '@masknet/web3-shared-base'
import { useChainContext } from '@masknet/web3-hooks-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { PluginTraderRPC } from '../messages.js'
import type { Currency } from '../types/index.js'
import { useQuery } from '@tanstack/react-query'

export function usePriceStats({
    chainId: expectedChainId,
    coinId,
    currency,
    days = Days.MAX,
    sourceType,
}: {
    chainId: Web3Helper.ChainIdAll
    coinId?: string
    currency?: Currency
    days?: Days
    sourceType?: SourceType
}) {
    const { chainId } = useChainContext({
        chainId: expectedChainId,
    })
    return useQuery({
        queryKey: ['price-stats', chainId, coinId, currency, days, sourceType],
        queryFn: async () => {
            if (isUndefined(days) || isUndefined(coinId) || isUndefined(sourceType) || isUndefined(currency))
                return EMPTY_LIST
            return PluginTraderRPC.getPriceStats(chainId, coinId, currency, days, sourceType)
        },
    })
}
