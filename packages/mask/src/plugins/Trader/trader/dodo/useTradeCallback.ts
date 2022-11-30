import { useMemo } from 'react'
import { useAsyncFn } from 'react-use'
import { pick } from 'lodash-es'
import stringify from 'json-stable-stringify'
import { useChainContext, useNetworkContext, useWeb3Connection } from '@masknet/web3-hooks-base'
import { NetworkPluginID } from '@masknet/shared-base'
import type { GasConfig, Transaction } from '@masknet/web3-shared-evm'
import type { SwapRouteSuccessResponse, TradeComputed } from '../../types/index.js'

export function useTradeCallback(tradeComputed: TradeComputed<SwapRouteSuccessResponse> | null, gasConfig?: GasConfig) {
    const { account, chainId } = useChainContext()
    const { pluginID } = useNetworkContext()
    const connection = useWeb3Connection(pluginID, { chainId })

    // compose transaction config
    const config = useMemo(() => {
        if (!account || !tradeComputed?.trade_) return null
        return {
            from: account,
            ...pick(tradeComputed.trade_, ['to', 'data', 'value']),
        } as Transaction
    }, [account, tradeComputed])

    return useAsyncFn(async () => {
        // validate config
        if (!account || !config || !connection || pluginID !== NetworkPluginID.PLUGIN_EVM) {
            return
        }

        // send transaction and wait for hash
        const esitmated = await connection.estimateTransaction?.(config)
        const hash = await connection.sendTransaction(
            {
                ...config,
                gas: esitmated ?? '0',
                ...gasConfig,
            },
            { chainId, overrides: { ...gasConfig } },
        )
        const receipt = await connection.getTransactionReceipt(hash)
        return receipt?.transactionHash
    }, [connection, account, chainId, stringify(config), gasConfig, pluginID])
}
