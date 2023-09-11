import { useMemo } from 'react'
import { useAsync } from 'react-use'
import type { AsyncState } from 'react-use/lib/useAsyncFn.js'
import { pick } from 'lodash-es'
import { NetworkPluginID } from '@masknet/shared-base'
import { Bancor, Web3 } from '@masknet/web3-providers'
import { useChainContext, useNetworkContext } from '@masknet/web3-hooks-base'
import type { SwapBancorRequest, TradeComputed } from '../../types/index.js'

export function useTradeGasLimit(tradeComputed: TradeComputed<SwapBancorRequest> | null): AsyncState<string> {
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const { pluginID } = useNetworkContext()

    const trade: SwapBancorRequest | null = useMemo(() => {
        if (!account || !tradeComputed?.trade_) return null
        return tradeComputed.trade_
    }, [account, tradeComputed])

    return useAsync(async () => {
        if (!account || !trade || pluginID !== NetworkPluginID.PLUGIN_EVM) return '0'

        try {
            const data = await Bancor.swapTransactionBancor(trade)

            // Note that if approval is required, the API will also return the necessary approval transaction.
            const tradeTransaction = data.length === 1 ? data[0] : data[1]

            const config = pick(tradeTransaction.transaction, ['to', 'data', 'value', 'from'])
            return await Web3.estimateTransaction?.(config, undefined, {
                chainId,
            })
        } catch {
            return '0'
        }
    }, [account, chainId, pluginID, trade])
}
