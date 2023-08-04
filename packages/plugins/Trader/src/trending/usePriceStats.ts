import { useAsyncRetry } from 'react-use'
import { isUndefined } from 'lodash-es'
import { Days } from '@masknet/shared-base'
import type { SourceType } from '@masknet/web3-shared-base'
import { useChainContext } from '@masknet/web3-hooks-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { PluginTraderRPC } from '../messages.js'
import type { Currency } from '../types/index.js'

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
    return useAsyncRetry(async () => {
        if (isUndefined(days) || isUndefined(coinId) || isUndefined(sourceType) || isUndefined(currency)) return []
        return PluginTraderRPC.getPriceStats(chainId, coinId, currency, days, sourceType)
    }, [coinId, sourceType, currency?.id, days])
}
