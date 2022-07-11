import stringify from 'json-stable-stringify'
import { pick } from 'lodash-unified'
import { useMemo } from 'react'
import { useAsyncFn } from 'react-use'
import type { TransactionConfig } from 'web3-core'
import type { GasOptionConfig } from '@masknet/web3-shared-evm'
import type { SwapOOSuccessResponse, TradeComputed } from '../../types'
import { NetworkPluginID, ZERO } from '@masknet/web3-shared-base'
import { useAccount, useChainId, useWeb3Connection } from '@masknet/plugin-infra/web3'
import { toHex } from 'web3-utils'

export function useTradeCallback(
    tradeComputed: TradeComputed<SwapOOSuccessResponse> | null,
    gasConfig?: GasOptionConfig,
) {
    const connection = useWeb3Connection(NetworkPluginID.PLUGIN_EVM)
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)

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
            gas:
                (await connection.estimateTransaction?.({
                    ...config,
                    value: config.value ? toHex(config.value) : undefined,
                })) ?? ZERO.toString(),
            ...gasConfig,
        }

        // send transaction and wait for hash

        const hash = await connection.sendTransaction(config_)
        const receipt = await connection.getTransactionReceipt(hash)
        return receipt?.transactionHash
    }, [connection, account, chainId, stringify(config)])
}
