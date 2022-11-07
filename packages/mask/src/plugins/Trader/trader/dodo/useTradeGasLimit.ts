import { useMemo } from 'react'
import { useAsync } from 'react-use'
import { pick } from 'lodash-es'
import { BigNumber } from 'bignumber.js'
import type { TransactionConfig } from 'web3-core'
import type { SwapRouteData, TradeComputed } from '../../types/index.js'
import type { AsyncState } from 'react-use/lib/useAsyncFn.js'
import { useChainContext, useNetworkContext, useWeb3Connection } from '@masknet/web3-hooks-base'
import { NetworkPluginID } from '@masknet/shared-base'

export function useTradeGasLimit(tradeComputed: TradeComputed<SwapRouteData> | null): AsyncState<number> {
    const { pluginID } = useNetworkContext()
    const { account, chainId } = useChainContext()
    const connection = useWeb3Connection(pluginID, { chainId })
    const config = useMemo(() => {
        if (!account || !tradeComputed?.trade_ || pluginID !== NetworkPluginID.PLUGIN_EVM) return null
        return {
            from: account,
            ...pick(tradeComputed.trade_, ['to', 'data', 'value']),
        } as TransactionConfig
    }, [account, tradeComputed])

    return useAsync(async () => {
        if (!config || !connection?.estimateTransaction) return 0

        const gas = await connection.estimateTransaction(config)
        return new BigNumber(gas).toNumber()
    }, [config, connection, pluginID])
}
