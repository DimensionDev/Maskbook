import { useMemo } from 'react'
import { useAsyncFn } from 'react-use'
import { pick } from 'lodash-es'
import stringify from 'json-stable-stringify'
import { useChainContext, useNetworkContext } from '@masknet/web3-hooks-base'
import { NetworkPluginID } from '@masknet/shared-base'
import type { GasConfig, Transaction } from '@masknet/web3-shared-evm'
import { Web3 } from '@masknet/web3-providers'
import type { SwapRouteSuccessResponse, TradeComputed } from '../../types/index.js'

export function useTradeCallback(tradeComputed: TradeComputed<SwapRouteSuccessResponse> | null, gasConfig?: GasConfig) {
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const { pluginID } = useNetworkContext()

    // compose transaction config
    const config = useMemo(() => {
        if (!account || !tradeComputed?.trade_) return null
        return {
            from: account,
            ...pick(tradeComputed.trade_, ['to', 'data', 'value']),
        } as Transaction
    }, [account, tradeComputed])

    return useAsyncFn(async () => {
        if (!account || !config || pluginID !== NetworkPluginID.PLUGIN_EVM) {
            return
        }

        try {
            const gas = await Web3.estimateTransaction?.(config, undefined, {
                chainId,
            })
            const hash = await Web3.sendTransaction(
                {
                    ...config,
                    gas,
                },
                { chainId, overrides: { ...gasConfig } },
            )
            const receipt = await Web3.confirmTransaction(hash, { chainId })
            return receipt.transactionHash
        } catch (error) {
            return
        }
    }, [account, chainId, stringify(config), gasConfig, pluginID])
}
