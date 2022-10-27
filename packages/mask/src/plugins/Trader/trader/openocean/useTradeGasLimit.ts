import { useMemo } from 'react'
import { useAsync } from 'react-use'
import type { AsyncState } from 'react-use/lib/useAsyncFn'
import { pick } from 'lodash-unified'
import BigNumber from 'bignumber.js'
import type { TransactionConfig } from 'web3-core'
import type { SwapOOData, TradeComputed } from '../../types/index.js'
import { useChainContext, useNetworkContext, useWeb3Connection } from '@masknet/web3-hooks-base'
import { NetworkPluginID } from '@masknet/shared-base'

export function useTradeGasLimit(tradeComputed: TradeComputed<SwapOOData> | null): AsyncState<number> {
    const { account, chainId } = useChainContext()
    const { pluginID } = useNetworkContext()
    const connection = useWeb3Connection(pluginID, { chainId })
    const config = useMemo(() => {
        if (!account || !tradeComputed?.trade_) return null
        return {
            from: account,
            ...pick(tradeComputed.trade_, ['to', 'data', 'value']),
        } as TransactionConfig
    }, [account, tradeComputed])

    return useAsync(async () => {
        if (tradeComputed?.trade_?.estimatedGas) return new BigNumber(tradeComputed.trade_.estimatedGas).toNumber()
        if (!config || !connection?.estimateTransaction || pluginID !== NetworkPluginID.PLUGIN_EVM) return 0
        const gas = await connection.estimateTransaction(config)
        return new BigNumber(gas).toNumber()
    }, [config, connection, tradeComputed?.trade_?.estimatedGas, pluginID])
}
