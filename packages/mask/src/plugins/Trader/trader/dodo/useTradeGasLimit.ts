import { useMemo } from 'react'
import { useAsync } from 'react-use'
import type { AsyncState } from 'react-use/lib/useAsyncFn.js'
import { pick } from 'lodash-es'
import { useChainContext, useNetworkContext, useWeb3Connection } from '@masknet/web3-hooks-base'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import type { Transaction } from '@masknet/web3-shared-evm'
import type { SwapRouteData, TradeComputed } from '../../types/index.js'
import { toHex } from 'web3-utils'

export function useTradeGasLimit(tradeComputed: TradeComputed<SwapRouteData> | null): AsyncState<string> {
    const { pluginID } = useNetworkContext()
    const { account, chainId } = useChainContext()
    const connection = useWeb3Connection(pluginID, { chainId })
    const config = useMemo(() => {
        if (!account || !tradeComputed?.trade_ || pluginID !== NetworkPluginID.PLUGIN_EVM) return null
        return {
            from: account,
            ...pick(tradeComputed.trade_, ['to', 'data', 'value']),
        } as Transaction
    }, [account, tradeComputed])

    return useAsync(async () => {
        if (!config?.value || !connection?.estimateTransaction) return '0'
        return connection.estimateTransaction({
            ...config,
            value: toHex(config.value),
        })
    }, [config, connection])
}
