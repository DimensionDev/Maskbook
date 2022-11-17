import { useMemo } from 'react'
import { useAsyncFn } from 'react-use'
import type { TransactionConfig } from 'web3-core'
import { pick } from 'lodash-es'
import stringify from 'json-stable-stringify'
import { useChainContext, useNetworkContext, useWeb3Connection } from '@masknet/web3-hooks-base'
import type { SwapRouteSuccessResponse, TradeComputed } from '../../types/index.js'
import { ZERO } from '@masknet/web3-shared-base'
import { NetworkPluginID } from '@masknet/shared-base'
import type { GasOptionConfig } from '@masknet/web3-shared-evm'

export function useTradeCallback(
    tradeComputed: TradeComputed<SwapRouteSuccessResponse> | null,
    gasConfig?: GasOptionConfig,
) {
    const { account, chainId } = useChainContext()
    const { pluginID } = useNetworkContext()
    const connection = useWeb3Connection(pluginID, { chainId })

    // compose transaction config
    const config = useMemo(() => {
        if (!account || !tradeComputed?.trade_) return null
        return {
            from: account,
            ...pick(tradeComputed.trade_, ['to', 'data', 'value']),
        } as TransactionConfig
    }, [account, tradeComputed])

    return useAsyncFn(async () => {
        // validate config
        if (!account || !config || !connection || pluginID !== NetworkPluginID.PLUGIN_EVM) {
            return
        }

        // compose transaction config
        const config_ = {
            ...config,
            gas: (await connection.estimateTransaction?.(config)) ?? ZERO.toString(),
            ...gasConfig,
        }

        // send transaction and wait for hash

        const hash = await connection.sendTransaction(config_, { chainId })
        const receipt = await connection.getTransactionReceipt(hash)

        return receipt?.transactionHash
    }, [connection, account, chainId, stringify(config), gasConfig, pluginID])
}
