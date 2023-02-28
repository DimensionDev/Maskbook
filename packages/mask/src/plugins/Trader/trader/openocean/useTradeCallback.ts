import { useMemo } from 'react'
import { useAsyncFn } from 'react-use'
import { pick } from 'lodash-es'
import stringify from 'json-stable-stringify'
import { NetworkPluginID } from '@masknet/shared-base'
import type { GasConfig, Transaction } from '@masknet/web3-shared-evm'
import { useChainContext, useNetworkContext, useWeb3Connection } from '@masknet/web3-hooks-base'
import type { SwapOOSuccessResponse, TradeComputed } from '../../types/index.js'
import { toHex } from 'web3-utils'

export function useTradeCallback(tradeComputed: TradeComputed<SwapOOSuccessResponse> | null, gasConfig?: GasConfig) {
    const connection = useWeb3Connection()
    const { account, chainId } = useChainContext()
    const { pluginID } = useNetworkContext()

    // compose transaction config
    const config = useMemo(() => {
        if (!account || !tradeComputed?.trade_ || pluginID !== NetworkPluginID.PLUGIN_EVM) return null

        return {
            from: account,
            value: tradeComputed.trade_.value ? toHex(tradeComputed.trade_.value) : undefined,
            ...pick(tradeComputed.trade_, ['to', 'data']),
            ...gasConfig,
        } as Transaction
    }, [account, tradeComputed, gasConfig])

    return useAsyncFn(async () => {
        if (!account || !config || !connection) {
            return
        }

        const gas = await connection.estimateTransaction?.(config)

        const hash = await connection.sendTransaction(
            {
                ...config,
                gas,
            },
            { chainId, overrides: { ...gasConfig } },
        )
        const receipt = await connection.getTransactionReceipt(hash)
        return receipt?.transactionHash
    }, [connection, account, chainId, stringify(config), pluginID])
}
