import { useCallback } from 'react'
import BigNumber from 'bignumber.js'
import { useAccount, useTransactionState, TransactionStateType, TransactionEventType } from '@masknet/web3-shared-evm'
import { useMarketContract } from '../contracts/useMarketContract'
import type { Card, Event } from '../types'
import { isAddress } from 'web3-utils'
import { ZERO_ADDRESS } from '../constants'

export function useRentCallback(market: Event, price: string, card: Card, duration = '0') {
    const account = useAccount()
    const contract = useMarketContract(market.id)
    const [rentState, setRentState] = useTransactionState()

    const rentCallback = useCallback(async () => {
        if (!contract || !isAddress(account)) {
            setRentState({
                type: TransactionStateType.UNKNOWN,
            })
            return
        }

        // pre-step: start waiting for provider to confirm tx
        setRentState({
            type: TransactionStateType.WAIT_FOR_CONFIRMING,
        })

        // step 1: estimate gas
        const config = {
            from: account,
            value: new BigNumber(0).toFixed(),
        }
        const estimatedGas = await contract.methods
            .newRental(price, duration, ZERO_ADDRESS, card.marketCardIndex)
            .estimateGas(config)
            .catch((error) => {
                setRentState({
                    type: TransactionStateType.FAILED,
                    error,
                })
                throw error
            })

        // step 2: blocking
        return new Promise<string>((resolve, reject) => {
            contract.methods
                .newRental(price, duration, ZERO_ADDRESS, card.marketCardIndex)
                .send({
                    ...config,
                    gas: estimatedGas,
                })
                .on(TransactionEventType.TRANSACTION_HASH, (hash) => {
                    setRentState({
                        type: TransactionStateType.HASH,
                        hash,
                    })
                    resolve(hash)
                })
                .on(TransactionEventType.ERROR, (error) => {
                    setRentState({
                        type: TransactionStateType.FAILED,
                        error,
                    })
                    reject(error)
                })
        })
    }, [contract, account, price, card, duration])

    const resetCallback = useCallback(() => {
        setRentState({
            type: TransactionStateType.UNKNOWN,
        })
    }, [])

    return [rentState, rentCallback, resetCallback] as const
}
