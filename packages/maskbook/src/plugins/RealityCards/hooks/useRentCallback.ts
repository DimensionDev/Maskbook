import { useCallback } from 'react'
import BigNumber from 'bignumber.js'
import { useAccount, useTransactionState, TransactionStateType, TransactionEventType } from '@masknet/web3-shared-evm'
import { useMarketContract } from '../contracts/useMarketContract'

/**
 * A callback for rent a card
 * @param address
 * @param price
 * @param cardIndex
 * @param duration
 */
export function useRentCallback(address: string, price: string, cardIndex: string, duration = '0') {
    const account = useAccount()
    const contract = useMarketContract(address)
    const [rentState, setRentState] = useTransactionState()

    const rentCallback = useCallback(async () => {
        if (!contract) {
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
            .newRental(price, duration, '0', cardIndex)
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
                .newRental(price, duration, '0', cardIndex)
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
    }, [contract, account, price, cardIndex, duration])

    const resetCallback = useCallback(() => {
        setRentState({
            type: TransactionStateType.UNKNOWN,
        })
    }, [])

    return [rentState, rentCallback, resetCallback] as const
}
