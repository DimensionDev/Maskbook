import { pick } from 'lodash-unified'
import { useMemo } from 'react'
import { useAsyncFn } from 'react-use'
import stringify from 'json-stable-stringify'
import { NetworkPluginID, ZERO } from '@masknet/web3-shared-base'
import { useAccount, useWeb3Connection } from '@masknet/plugin-infra/web3'
import type { GasOptionConfig } from '@masknet/web3-shared-evm'
import { PluginTraderRPC } from '../../messages'
import type { SwapBancorRequest, TradeComputed } from '../../types'
import { TargetChainIdContext } from '@masknet/plugin-infra/web3-evm'
import { toHex } from 'web3-utils'

export function useTradeCallback(tradeComputed: TradeComputed<SwapBancorRequest> | null, gasConfig?: GasOptionConfig) {
    const { targetChainId: chainId } = TargetChainIdContext.useContainer()
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
    }, [connection, account, chainId, stringify(trade), gasConfig])
}
