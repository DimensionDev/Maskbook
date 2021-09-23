import { useCallback, useMemo, useState } from 'react'
import stringify from 'json-stable-stringify'
import { TransactionState, TransactionStateType, useAccount, useChainId, useWeb3 } from '@masknet/web3-shared'
import type { SwapBancorRequest } from '../../types/bancor'
import type { TradeComputed } from '../../types'
import { PluginTraderRPC } from '../../messages'
import { pick } from 'lodash-es'

export function useTradeCallback(tradeComputed: TradeComputed<SwapBancorRequest> | null) {
    const web3 = useWeb3()
    const account = useAccount()
    const chainId = useChainId()
    const [tradeState, setTradeState] = useState<TransactionState>({
        type: TransactionStateType.UNKNOWN,
    })

    const trade: SwapBancorRequest | null = useMemo(() => {
        if (!account || !tradeComputed?.trade_) return null
        return tradeComputed.trade_
    }, [account, tradeComputed])

    const tradeCallback = useCallback(async () => {
        if (!account || !trade) {
            setTradeState({
                type: TransactionStateType.UNKNOWN,
            })
            return
        }

        setTradeState({
            type: TransactionStateType.WAIT_FOR_CONFIRMING,
        })

        const [data, err] = await PluginTraderRPC.swapTransactionBancor(trade)
        if (err) {
            const error = new Error(err.error.messages?.[0] || 'Unknown Error')
            setTradeState({
                type: TransactionStateType.FAILED,
                error: error,
            })
            throw error
        }

        // Note that if approval is required, the API will also return the necessary approval transaction.
        const tradeTransaction = data.length === 1 ? data[0] : data[1]

        const config = pick(tradeTransaction.transaction, ['to', 'data', 'value', 'from'])
        const config_ = {
            ...config,
            gas: await web3.eth.estimateGas(config).catch((error) => {
                setTradeState({
                    type: TransactionStateType.FAILED,
                    error,
                })
                throw error
            }),
        }

        // send transaction and wait for hash
        return new Promise<string>((resolve, reject) => {
            web3.eth.sendTransaction(config_, (error, hash) => {
                if (error) {
                    setTradeState({
                        type: TransactionStateType.FAILED,
                        error,
                    })
                    reject(error)
                } else {
                    setTradeState({
                        type: TransactionStateType.HASH,
                        hash,
                    })
                    resolve(hash)
                }
            })
        })
    }, [web3, account, chainId, stringify(trade)])

    const resetCallback = useCallback(() => {
        setTradeState({
            type: TransactionStateType.UNKNOWN,
        })
    }, [])

    return [tradeState, tradeCallback, resetCallback] as const
}
