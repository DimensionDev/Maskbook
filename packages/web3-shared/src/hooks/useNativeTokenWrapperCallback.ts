import { useCallback } from 'react'
import type { NonPayableTx, PayableTx } from '@masknet/contracts/types/types'
import { useNativeTokenWrapperContract } from '../contracts/useWrappedEtherContract'
import { useAccount } from './useAccount'
import { TransactionStateType, useTransactionState } from './useTransactionState'
import { useNonce } from './useNonce'
import { useGasPrice } from './useGasPrice'
import { TransactionEventType } from '../types'
import { isLessThan, isZero } from '../utils'

export function useNativeTokenWrapperCallback() {
    const nonce = useNonce()
    const gasPrice = useGasPrice()
    const account = useAccount()
    const wrapperContract = useNativeTokenWrapperContract()
    const [transactionState, setTransactionState] = useTransactionState()

    const wrapCallback = useCallback(
        async (amount: string) => {
            if (!wrapperContract || !amount) {
                setTransactionState({
                    type: TransactionStateType.UNKNOWN,
                })
                return
            }

            // error: invalid deposit amount
            if (isZero(amount)) {
                setTransactionState({
                    type: TransactionStateType.FAILED,
                    error: new Error('Invalid deposit amount'),
                })
                return
            }

            // start waiting for provider to confirm tx
            setTransactionState({
                type: TransactionStateType.WAIT_FOR_CONFIRMING,
            })

            // estimate gas and compose transaction
            const config = {
                from: account,
                value: amount,
                gas: await wrapperContract.methods
                    .deposit()
                    .estimateGas({
                        from: account,
                        value: amount,
                    })
                    .catch((error) => {
                        setTransactionState({
                            type: TransactionStateType.FAILED,
                            error,
                        })
                        throw error
                    }),
                gasPrice,
                nonce,
            }

            // send transaction and wait for hash
            return new Promise<string>((resolve, reject) => {
                wrapperContract.methods
                    .deposit()
                    .send(config as PayableTx)
                    .on(TransactionEventType.TRANSACTION_HASH, (hash) => {
                        setTransactionState({
                            type: TransactionStateType.HASH,
                            hash,
                        })
                        resolve(hash)
                    })
                    .on(TransactionEventType.ERROR, (error) => {
                        setTransactionState({
                            type: TransactionStateType.FAILED,
                            error,
                        })
                        reject(error)
                    })
            })
        },
        [nonce, gasPrice, account, wrapperContract],
    )

    const unwrapCallback = useCallback(
        async (all = true, amount = '0') => {
            if (!wrapperContract || !amount) {
                setTransactionState({
                    type: TransactionStateType.UNKNOWN,
                })
                return
            }

            // read balance
            const wethBalance = await wrapperContract.methods.balanceOf(account).call()

            // error: invalid withdraw amount
            if (all === false && isZero(amount)) {
                setTransactionState({
                    type: TransactionStateType.FAILED,
                    error: new Error('Invalid withdraw amount'),
                })
                return
            }

            // error: insufficent weth balance
            if (all === false && isLessThan(wethBalance, amount)) {
                setTransactionState({
                    type: TransactionStateType.FAILED,
                    error: new Error('Insufficent WETH balance'),
                })
                return
            }

            // start waiting for provider to confirm tx
            setTransactionState({
                type: TransactionStateType.WAIT_FOR_CONFIRMING,
            })

            // estimate gas and compose transaction
            const withdrawAmount = all ? wethBalance : amount
            const config = {
                from: account,
                gas: await wrapperContract.methods
                    .withdraw(withdrawAmount)
                    .estimateGas({
                        from: account,
                    })
                    .catch((error) => {
                        setTransactionState({
                            type: TransactionStateType.FAILED,
                            error,
                        })
                        throw error
                    }),
                gasPrice,
                nonce,
            }
            // send transaction and wait for hash
            return new Promise<string>((resolve, reject) => {
                wrapperContract.methods
                    .withdraw(withdrawAmount)
                    .send(config as NonPayableTx)
                    .on(TransactionEventType.TRANSACTION_HASH, (hash) => {
                        setTransactionState({
                            type: TransactionStateType.HASH,
                            hash,
                        })
                        resolve(hash)
                    })
                    .on(TransactionEventType.ERROR, (error) => {
                        setTransactionState({
                            type: TransactionStateType.FAILED,
                            error,
                        })
                        reject(error)
                    })
            })
        },
        [nonce, gasPrice, account, wrapperContract],
    )

    const resetCallback = useCallback(() => {
        setTransactionState({
            type: TransactionStateType.UNKNOWN,
        })
    }, [])

    return [transactionState, wrapCallback, unwrapCallback, resetCallback] as const
}
