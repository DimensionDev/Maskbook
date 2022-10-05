import { useMemo } from 'react'
import { useAsyncFn } from 'react-use'
import { pick } from 'lodash-unified'
import stringify from 'json-stable-stringify'
import type { TransactionConfig } from 'web3-core'
import type { GasOptionConfig } from '@masknet/web3-shared-evm'
import type { SwapQuoteResponse, TradeComputed } from '../../types/index.js'
import { SUPPORTED_CHAIN_ID_LIST } from './constants.js'
import { NetworkPluginID, ZERO } from '@masknet/web3-shared-base'
import { useAccount, useChainId, useWeb3Connection } from '@masknet/web3-hooks-base'

export function useTradeCallback(tradeComputed: TradeComputed<SwapQuoteResponse> | null, gasConfig?: GasOptionConfig) {
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
    const connection = useWeb3Connection(NetworkPluginID.PLUGIN_EVM, { chainId })

    // compose transaction config
    const config = useMemo(() => {
        if (!account || !tradeComputed?.trade_ || !SUPPORTED_CHAIN_ID_LIST.includes(chainId)) return null
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
        const hash = await connection.sendTransaction(config_)
        const receipt = await connection.getTransactionReceipt(hash)

        return receipt?.transactionHash
    }, [connection, account, chainId, stringify(config), gasConfig])
}
