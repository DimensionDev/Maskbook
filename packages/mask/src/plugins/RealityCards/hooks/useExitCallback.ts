import { useCallback } from 'react'
import BigNumber from 'bignumber.js'
import { useAccount, useTransactionState, TransactionStateType, TransactionEventType } from '@masknet/web3-shared-evm'
import { useMarketContract } from '../contracts/useMarketContract'
import type { Card, Event } from '../types'
import { isAddress } from 'web3-utils'

export function useExitCallback(market: Event, card: Card) {
    const account = useAccount()
    const contract = useMarketContract(market.id)
    const [state, setState] = useTransactionState()

    const callback = useCallback(async () => {
        if (!contract || !isAddress(account)) {
            setState({
                type: TransactionStateType.UNKNOWN,
            })
            return
        }

        // pre-step: start waiting for provider to confirm tx
        setState({
            type: TransactionStateType.WAIT_FOR_CONFIRMING,
        })

        // step 1: estimate gas
        const config = {
            from: account,
            value: new BigNumber(0).toFixed(),
        }
        const estimatedGas = await contract.methods
            .exit(card.marketCardIndex)
            .estimateGas(config)
            .catch((error) => {
                setState({
                    type: TransactionStateType.FAILED,
                    error,
                })
                throw error
            })

        // step 2: blocking
        return new Promise<string>((resolve, reject) => {
            contract.methods
                .exit(card.marketCardIndex)
                .send({
                    ...config,
                    gas: estimatedGas,
                })
                .on(TransactionEventType.TRANSACTION_HASH, (hash) => {
                    setState({
                        type: TransactionStateType.HASH,
                        hash,
                    })
                    resolve(hash)
                })
                .on(TransactionEventType.ERROR, (error) => {
                    setState({
                        type: TransactionStateType.FAILED,
                        error,
                    })
                    reject(error)
                })
        })
    }, [contract, account, card])

    const resetCallback = useCallback(() => {
        setState({
            type: TransactionStateType.UNKNOWN,
        })
    }, [])

    return [state, callback, resetCallback] as const
}
