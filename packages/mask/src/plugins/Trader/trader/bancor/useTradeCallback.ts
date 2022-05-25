import { GasOptionConfig, TransactionEventType, useAccount, useWeb3 } from '@masknet/web3-shared-evm'
import stringify from 'json-stable-stringify'
import { pick } from 'lodash-unified'
import { useMemo } from 'react'
import { useAsyncFn } from 'react-use'
import { PluginTraderRPC } from '../../messages'
import type { SwapBancorRequest, TradeComputed } from '../../types'
import { TargetChainIdContext } from '../useTargetChainIdContext'

export function useTradeCallback(tradeComputed: TradeComputed<SwapBancorRequest> | null, gasConfig?: GasOptionConfig) {
    const { targetChainId: chainId } = TargetChainIdContext.useContainer()
    const web3 = useWeb3({ chainId })
    const account = useAccount()

    const trade: SwapBancorRequest | null = useMemo(() => {
        if (!account || !tradeComputed?.trade_) return null
        return tradeComputed.trade_
    }, [account, tradeComputed])

    return useAsyncFn(async () => {
        if (!account || !trade) {
            return
        }

        const [data, err] = await PluginTraderRPC.swapTransactionBancor(trade)
        if (err) {
            const error = new Error(err.error.messages?.[0] || 'Unknown Error')
            throw error
        }

        // Note that if approval is required, the API will also return the necessary approval transaction.
        const tradeTransaction = data.length === 1 ? data[0] : data[1]

        const config = pick(tradeTransaction.transaction, ['to', 'data', 'value', 'from'])
        const config_ = {
            ...config,
            gas: await web3.eth.estimateGas(config).catch((error) => {
                throw error
            }),
            ...gasConfig,
        }

        // send transaction and wait for hash
        return new Promise<string>((resolve, reject) => {
            web3.eth
                .sendTransaction(config_)
                .on(TransactionEventType.ERROR, reject)
                .on(TransactionEventType.CONFIRMATION, (_, receipt) => {
                    resolve(receipt.transactionHash)
                })
        })
    }, [web3, account, chainId, stringify(trade), gasConfig])
}
