import { pick } from 'lodash-es'
import { useMemo } from 'react'
import { useAsync } from 'react-use'
import { useChainContext, useNetworkContext } from '@masknet/web3-hooks-base'
import { NetworkPluginID } from '@masknet/shared-base'
import { Web3 } from '@masknet/web3-providers'
import type { TraderAPI } from '@masknet/web3-providers/types'
import { SUPPORTED_CHAIN_ID_LIST } from './constants.js'
import type { SwapQuoteResponse } from '../../types/index.js'

export function useTradeGasLimit(tradeComputed: TraderAPI.TradeComputed<SwapQuoteResponse> | null) {
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const { pluginID } = useNetworkContext()
    const config = useMemo(() => {
        if (!account || !tradeComputed?.trade_) return null
        return {
            from: account,
            ...pick(tradeComputed.trade_, ['to', 'data', 'value']),
        }
    }, [account, tradeComputed])

    return useAsync(async () => {
        if (
            !tradeComputed?.trade_ ||
            pluginID !== NetworkPluginID.PLUGIN_EVM ||
            !SUPPORTED_CHAIN_ID_LIST.includes(chainId) ||
            !config
        )
            return '0'
        return Web3.estimateTransaction?.(config, undefined, { chainId })
    }, [chainId, tradeComputed, config, pluginID])
}
