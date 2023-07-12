import { useMemo } from 'react'
import { useAsyncFn } from 'react-use'
import { pick } from 'lodash-es'
import stringify from 'json-stable-stringify'
import type { GasConfig, Transaction } from '@masknet/web3-shared-evm'
import { NetworkPluginID } from '@masknet/shared-base'
import { Web3 } from '@masknet/web3-providers'
import { useChainContext, useNetworkContext } from '@masknet/web3-hooks-base'
import type { SwapQuoteResponse, TradeComputed } from '../../types/index.js'
import { SUPPORTED_CHAIN_ID_LIST } from './constants.js'
import { useSwapErrorCallback } from '../../SNSAdaptor/trader/hooks/useSwapErrorCallback.js'

export function useTradeCallback(tradeComputed: TradeComputed<SwapQuoteResponse> | null, gasConfig?: GasConfig) {
    const notifyError = useSwapErrorCallback()
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const { pluginID } = useNetworkContext()

    const config = useMemo(() => {
        if (
            !account ||
            !tradeComputed?.trade_ ||
            pluginID !== NetworkPluginID.PLUGIN_EVM ||
            !SUPPORTED_CHAIN_ID_LIST.includes(chainId)
        )
            return null
        return {
            from: account,
            ...pick(tradeComputed.trade_, ['to', 'data', 'value']),
            ...gasConfig,
        } as Transaction
    }, [account, tradeComputed, gasConfig])

    return useAsyncFn(async () => {
        if (!account || !config || !tradeComputed?.trade_) {
            return
        }

        try {
            const gas = await Web3.estimateTransaction?.(
                {
                    from: account,
                    ...pick(tradeComputed.trade_, ['to', 'data', 'value']),
                },
                undefined,
                { chainId },
            )
            const hash = await Web3.sendTransaction(
                {
                    ...config,
                    gas,
                },
                { chainId, overrides: { ...gasConfig } },
            )
            const receipt = await Web3.getTransactionReceipt(hash)
            if (!receipt?.status) return
            return receipt?.transactionHash
        } catch (error: unknown) {
            if (error instanceof Error) {
                notifyError(error.message)
            }
            return
        }
    }, [account, chainId, stringify(config), gasConfig, pluginID])
}
