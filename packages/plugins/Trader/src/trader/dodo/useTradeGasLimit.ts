import { useMemo } from 'react'
import { useAsync } from 'react-use'
import type { AsyncState } from 'react-use/lib/useAsyncFn.js'
import { pick } from 'lodash-es'
import { useChainContext, useNetworkContext } from '@masknet/web3-hooks-base'
import { Web3 } from '@masknet/web3-providers'
import type { TraderAPI } from '@masknet/web3-providers/types'
import { NetworkPluginID } from '@masknet/shared-base'
import type { Transaction } from '@masknet/web3-shared-evm'
import type { SwapRouteData } from '../../types/index.js'

export function useTradeGasLimit(tradeComputed: TraderAPI.TradeComputed<SwapRouteData> | null): AsyncState<string> {
    const { pluginID } = useNetworkContext()
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const config = useMemo(() => {
        if (!account || !tradeComputed?.trade_ || pluginID !== NetworkPluginID.PLUGIN_EVM) return null
        return {
            from: account,
            ...pick(tradeComputed.trade_, ['to', 'data', 'value']),
        } as Transaction
    }, [account, tradeComputed])

    return useAsync(async () => {
        if (!config?.value) return '0'
        return Web3.estimateTransaction?.(config, undefined, {
            chainId,
        })
    }, [chainId, config])
}
