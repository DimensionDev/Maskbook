import { useMemo } from 'react'
import { useAsync } from 'react-use'
import type { AsyncState } from 'react-use/lib/useAsyncFn.js'
import { pick } from 'lodash-es'
import { NetworkPluginID } from '@masknet/shared-base'
import { useChainContext, useNetworkContext, useWeb3Connection } from '@masknet/web3-hooks-base'
import type { SwapBancorRequest, TradeComputed } from '../../types/index.js'
import { PluginTraderRPC } from '../../messages.js'

export function useTradeGasLimit(tradeComputed: TradeComputed<SwapBancorRequest> | null): AsyncState<string> {
    const { account, chainId: targetChainId } = useChainContext()
    const { pluginID } = useNetworkContext()
    const connection = useWeb3Connection(pluginID, { chainId: targetChainId })

    const trade: SwapBancorRequest | null = useMemo(() => {
        if (!account || !tradeComputed?.trade_) return null
        return tradeComputed.trade_
    }, [account, tradeComputed])

    return useAsync(async () => {
        if (!account || !trade || !connection?.estimateTransaction || pluginID !== NetworkPluginID.PLUGIN_EVM)
            return '0'

        const [data, err] = await PluginTraderRPC.swapTransactionBancor(trade)

        if (err) return '0'

        // Note that if approval is required, the API will also return the necessary approval transaction.
        const tradeTransaction = data.length === 1 ? data[0] : data[1]

        return connection.estimateTransaction(pick(tradeTransaction.transaction, ['to', 'data', 'value', 'from']))
    }, [trade, account, connection, pluginID])
}
