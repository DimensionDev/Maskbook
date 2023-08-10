import { pick } from 'lodash-es'
import { useMemo } from 'react'
import { useAsyncFn } from 'react-use'
import stringify from 'json-stable-stringify'
import { ZERO } from '@masknet/web3-shared-base'
import { useChainContext, useNetworkContext } from '@masknet/web3-hooks-base'
import { NetworkPluginID } from '@masknet/shared-base'
import type { GasConfig } from '@masknet/web3-shared-evm'
import { Web3 } from '@masknet/web3-providers'
import { PluginTraderRPC } from '../../messages.js'
import type { SwapBancorRequest, TradeComputed } from '../../types/index.js'
import { useSwapErrorCallback } from '../../SiteAdaptor/trader/hooks/useSwapErrorCallback.js'

export function useTradeCallback(tradeComputed: TradeComputed<SwapBancorRequest> | null, gasConfig?: GasConfig) {
    const notifyError = useSwapErrorCallback()
    const { pluginID } = useNetworkContext()
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()

    const trade: SwapBancorRequest | null = useMemo(() => {
        if (!account || !tradeComputed?.trade_) return null
        return tradeComputed.trade_
    }, [account, tradeComputed])

    return useAsyncFn(async () => {
        if (!account || !trade || pluginID !== NetworkPluginID.PLUGIN_EVM) {
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
            const gas = await Web3.estimateTransaction?.(config, undefined, {
                chainId,
            })
            const config_ = {
                ...config,
                gas: gas ?? ZERO.toString(),
            }

            // send transaction and wait for hash

            const hash = await Web3.sendTransaction(config_, { chainId, overrides: { ...gasConfig } })
            const receipt = await Web3.getTransactionReceipt(hash, {
                chainId,
            })

            if (!receipt?.status) return

            return receipt?.transactionHash
        } catch (error) {
            if (error instanceof Error) {
                notifyError(error.message)
            }
            return
        }
    }, [account, chainId, stringify(trade), gasConfig, pluginID, notifyError])
}
