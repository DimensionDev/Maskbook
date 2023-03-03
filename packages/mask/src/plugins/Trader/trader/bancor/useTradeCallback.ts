import { pick } from 'lodash-es'
import { useMemo } from 'react'
import { useAsyncFn } from 'react-use'
import stringify from 'json-stable-stringify'
import { ZERO } from '@masknet/web3-shared-base'
import { useChainContext, useNetworkContext, useWeb3Connection } from '@masknet/web3-hooks-base'
import { NetworkPluginID } from '@masknet/shared-base'
import type { GasConfig } from '@masknet/web3-shared-evm'
import { PluginTraderRPC } from '../../messages.js'
import type { SwapBancorRequest, TradeComputed } from '../../types/index.js'
import { useSwapErrorCallback } from '../../SNSAdaptor/trader/hooks/useSwapErrorCallback.js'

export function useTradeCallback(tradeComputed: TradeComputed<SwapBancorRequest> | null, gasConfig?: GasConfig) {
    const notifyError = useSwapErrorCallback()
    const { account, chainId } = useChainContext()
    const { pluginID } = useNetworkContext()
    const connection = useWeb3Connection(pluginID, { chainId })

    const trade: SwapBancorRequest | null = useMemo(() => {
        if (!account || !tradeComputed?.trade_) return null
        return tradeComputed.trade_
    }, [account, tradeComputed])

    return useAsyncFn(async () => {
        if (!account || !trade || !connection || pluginID !== NetworkPluginID.PLUGIN_EVM) {
            return
        }

        const [data, err] = await PluginTraderRPC.swapTransactionBancor(trade)
        if (err) {
            throw new Error(err.error.messages?.[0] || 'Unknown Error')
        }

        // Note that if approval is required, the API will also return the necessary approval transaction.
        const tradeTransaction = data.length === 1 ? data[0] : data[1]

        try {
            const config = pick(tradeTransaction.transaction, ['to', 'data', 'from', 'value'])
            const gas = await connection.estimateTransaction?.(config)
            const config_ = {
                ...config,
                gas: gas ?? ZERO.toString(),
            }

            // send transaction and wait for hash

            const hash = await connection.sendTransaction(config_, { chainId, overrides: { ...gasConfig } })
            const receipt = await connection.getTransactionReceipt(hash)

            return receipt?.transactionHash
        } catch (error) {
            if (error instanceof Error) {
                notifyError(error.message)
            }
            return
        }
    }, [connection, account, chainId, stringify(trade), gasConfig, pluginID, notifyError])
}
