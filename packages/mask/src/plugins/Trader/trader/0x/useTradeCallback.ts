import { useCallback, useMemo, useState } from 'react'
import stringify from 'json-stable-stringify'
import { pick } from 'lodash-unified'
import type { TransactionConfig } from 'web3-core'
import { GasOptionConfig, TransactionState, TransactionStateType, useAccount, useWeb3 } from '@masknet/web3-shared-evm'
import type { SwapQuoteResponse, TradeComputed } from '../../types'
import { TargetChainIdContext } from '../useTargetChainIdContext'
import { SUPPORTED_CHAIN_ID_LIST } from './constants'

export function useTradeCallback(tradeComputed: TradeComputed<SwapQuoteResponse> | null, gasConfig?: GasOptionConfig) {
    const account = useAccount()
    const { targetChainId: chainId } = TargetChainIdContext.useContainer()

    const web3 = useWeb3({ chainId })
    const [tradeState, setTradeState] = useState<TransactionState>({
        type: TransactionStateType.UNKNOWN,
    })

    // compose transaction config
    const config = useMemo(() => {
        if (!account || !tradeComputed?.trade_ || !SUPPORTED_CHAIN_ID_LIST.includes(chainId)) return null
        return {
            from: account,
            ...pick(tradeComputed.trade_, ['to', 'data', 'value']),
            ...gasConfig,
        } as TransactionConfig
    }, [account, tradeComputed])

    const tradeCallback = useCallback(async () => {
        // validate config
        if (!account || !config || !tradeComputed) {
            setTradeState({
                type: TransactionStateType.UNKNOWN,
            })
            return
        }

        // start waiting for provider to confirm tx
        setTradeState({
            type: TransactionStateType.WAIT_FOR_CONFIRMING,
        })

        const config_ = {
            ...config,
            gas: await web3.eth
                .estimateGas({
                    from: account,
                    ...pick(tradeComputed.trade_, ['to', 'data', 'value']),
                })
                .catch((error) => {
                    console.log(error)
                    setTradeState({
                        type: TransactionStateType.FAILED,
                        error,
                    })
                    return 0
                }),
        }

        // estimate transaction
        try {
            await web3.eth.call(config_)
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
    }, [web3, account, chainId, stringify(config), gasConfig])

    const resetCallback = useCallback(() => {
        setTradeState({
            type: TransactionStateType.UNKNOWN,
        })
    }, [])

    return [tradeState, tradeCallback, resetCallback] as const
}
