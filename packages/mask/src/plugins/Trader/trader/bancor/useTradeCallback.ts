import { pick } from 'lodash-unified'
import { useMemo } from 'react'
import { useAsyncFn } from 'react-use'
import stringify from 'json-stable-stringify'
import { ZERO } from '@masknet/web3-shared-base'
import { NetworkPluginID } from '@masknet/shared-base'
import { useAccount, useChainId, useWeb3Connection } from '@masknet/web3-hooks-base'
import type { GasOptionConfig } from '@masknet/web3-shared-evm'
import { PluginTraderRPC } from '../../messages.js'
import type { SwapBancorRequest, TradeComputed } from '../../types/index.js'

export function useTradeCallback(tradeComputed: TradeComputed<SwapBancorRequest> | null, gasConfig?: GasOptionConfig) {
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const connection = useWeb3Connection(NetworkPluginID.PLUGIN_EVM, { chainId })
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)

    const trade: SwapBancorRequest | null = useMemo(() => {
        if (!account || !tradeComputed?.trade_) return null
        return tradeComputed.trade_
    }, [account, tradeComputed])

    return useAsyncFn(async () => {
        if (!account || !trade || !connection) {
            return
        }

        const [data, err] = await PluginTraderRPC.swapTransactionBancor(trade)
        if (err) {
            throw new Error(err.error.messages?.[0] || 'Unknown Error')
        }

        // Note that if approval is required, the API will also return the necessary approval transaction.
        const tradeTransaction = data.length === 1 ? data[0] : data[1]

        const config = pick(tradeTransaction.transaction, ['to', 'data', 'value', 'from'])
        const config_ = {
            ...config,
            gas: (await connection.estimateTransaction?.(config)) ?? ZERO.toString(),
            ...gasConfig,
        }

        // send transaction and wait for hash

        const hash = await connection.sendTransaction(config_)
        const receipt = await connection.getTransactionReceipt(hash)

        return receipt?.transactionHash
    }, [connection, account, chainId, stringify(trade), gasConfig])
}
