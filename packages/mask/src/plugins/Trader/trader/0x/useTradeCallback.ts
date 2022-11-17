import { useMemo } from 'react'
import { useAsyncFn } from 'react-use'
import { pick } from 'lodash-es'
import stringify from 'json-stable-stringify'
import type { TransactionConfig } from 'web3-core'
import type { ChainId, GasOptionConfig } from '@masknet/web3-shared-evm'
import type { SwapQuoteResponse, TradeComputed } from '../../types/index.js'
import { SUPPORTED_CHAIN_ID_LIST } from './constants.js'
import { ZERO } from '@masknet/web3-shared-base'
import { NetworkPluginID } from '@masknet/shared-base'
import { useChainContext, useNetworkContext, useWeb3Connection } from '@masknet/web3-hooks-base'

export function useTradeCallback(tradeComputed: TradeComputed<SwapQuoteResponse> | null, gasConfig?: GasOptionConfig) {
    const { account, chainId } = useChainContext()
    const { pluginID } = useNetworkContext()
    const connection = useWeb3Connection()

    // compose transaction config
    const config = useMemo(() => {
        if (
            !account ||
            !tradeComputed?.trade_ ||
            pluginID !== NetworkPluginID.PLUGIN_EVM ||
            !SUPPORTED_CHAIN_ID_LIST.includes(chainId as ChainId)
        )
            return null
        return {
            from: account,
            ...pick(tradeComputed.trade_, ['to', 'data', 'value']),
            ...gasConfig,
        } as TransactionConfig
    }, [account, tradeComputed, gasConfig])

    return useAsyncFn(async () => {
        // validate config
        if (!account || !config || !tradeComputed || !connection) {
            return
        }

        const config_ = {
            ...config,
            gas:
                (await connection.estimateTransaction?.({
                    from: account,
                    ...pick(tradeComputed.trade_, ['to', 'data', 'value']),
                })) ?? ZERO.toString(),
        }

        // send transaction and wait for hash
        const hash = await connection.sendTransaction(config_, { chainId })
        const receipt = await connection.getTransactionReceipt(hash)

        return receipt?.transactionHash
    }, [connection, account, chainId, stringify(config), gasConfig, pluginID])
}
