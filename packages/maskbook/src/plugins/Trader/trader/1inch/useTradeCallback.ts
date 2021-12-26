import { useCallback, useMemo, useState } from 'react'
import stringify from 'json-stable-stringify'
import { pick } from 'lodash-es'
import type { TransactionConfig } from 'web3-core'
import {
    ChainId,
    TransactionState,
    TransactionStateType,
    useAccount,
    useChainId,
    useGasPrice,
    useNonce,
    useWeb3,
} from '@masknet/web3-shared-evm'
import type { TradeComputed, SwapQuoteOneResponse } from '../../types'

export function useTradeCallback(tradeComputed: TradeComputed<SwapQuoteOneResponse> | null) {
    const web3 = useWeb3()
    const nonce = useNonce()
    const gasPrice = useGasPrice()
    const account = useAccount()
    const chainId = useChainId()
    const [tradeState, setTradeState] = useState<TransactionState>({
        type: TransactionStateType.UNKNOWN,
    })

    // compose transaction config
    const config = useMemo(() => {
        if (!account || !tradeComputed?.trade_ || ![ChainId.Mainnet, ChainId.BSC, ChainId.Matic].includes(chainId))
            return null
        return {
            from: account,
            ...pick(tradeComputed.trade_, ['to', 'data', 'value', 'gas', 'gasPrice']),
        } as TransactionConfig
    }, [account, tradeComputed])

    const tradeCallback = useCallback(async () => {
        // validate config
        if (!account || !config) {
            setTradeState({
                type: TransactionStateType.UNKNOWN,
            })
            return
        }

        // start waiting for provider to confirm tx
        setTradeState({
            type: TransactionStateType.WAIT_FOR_CONFIRMING,
        })

        // estimate transaction
        try {
            await web3.eth.call(config)
        } catch {
            // for some transactions will always fail if we do estimation before a kick to the chain
            if (
                !confirm(
                    'Failed to estimated the transaction, which means it may be reverted on the chain, and your transaction fee will not return. Sure to continue?',
                )
            ) {
                setTradeState({
                    type: TransactionStateType.FAILED,
                    error: new Error('User denied the transaction.'),
                })
                return
            }
        }

        // compose transaction config
        const config_ = {
            ...config,
            nonce,
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
    }, [web3, nonce, gasPrice, account, chainId, stringify(config)])

    const resetCallback = useCallback(() => {
        setTradeState({
            type: TransactionStateType.UNKNOWN,
        })
    }, [])

    return [tradeState, tradeCallback, resetCallback] as const
}
