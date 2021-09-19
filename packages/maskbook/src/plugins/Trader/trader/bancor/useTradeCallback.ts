import { useCallback, useMemo, useState } from 'react'
import stringify from 'json-stable-stringify'
import { TransactionState, TransactionStateType, useAccount, useChainId, useWeb3 } from '@masknet/web3-shared'
import type { SwapBancorRequest } from '../../types/bancor'
import type { TradeComputed } from '../../types'
import { PluginTraderRPC } from '../../messages'

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

        const data = await PluginTraderRPC.swapTransactionBancor(trade)
        if (!data) {
            const error = new Error('Unknown Error')
            setTradeState({
                type: TransactionStateType.FAILED,
                error: error,
            })
            throw error
        }

        const [transaction] = data

        const config_ = {
            ...transaction.transaction,
            gas: await web3.eth.estimateGas(transaction.transaction).catch((error) => {
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
