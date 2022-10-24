import stringify from 'json-stable-stringify'
import { pick } from 'lodash-unified'
import { useMemo } from 'react'
import { useAsyncFn } from 'react-use'
import type { TransactionConfig } from 'web3-core'
import type { GasOptionConfig } from '@masknet/web3-shared-evm'
import type { SwapOOSuccessResponse, TradeComputed } from '../../types/index.js'
import { ZERO } from '@masknet/web3-shared-base'
import { NetworkPluginID } from '@masknet/shared-base'
import { useChainContext, useWeb3Connection } from '@masknet/web3-hooks-base'

export function useTradeCallback(
    tradeComputed: TradeComputed<SwapOOSuccessResponse> | null,
    gasConfig?: GasOptionConfig,
) {
    const connection = useWeb3Connection(NetworkPluginID.PLUGIN_EVM)
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()

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
        if (!account || !config || !connection) {
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
    }, [connection, account, chainId, stringify(config)])
}
