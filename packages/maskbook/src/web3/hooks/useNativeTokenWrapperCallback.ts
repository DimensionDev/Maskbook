import { useCallback } from 'react'
import BigNumber from 'bignumber.js'
import type { NonPayableTx, PayableTx } from '@dimensiondev/contracts/types/types'
import { useNativeTokenWrapperContract } from '../contracts/useWrappedEtherContract'
import { useAccount } from './useAccount'
import { TransactionStateType, useTransactionState } from './useTransactionState'
import Services from '../../extension/service'
import { TransactionEventType } from '../types'

export function useNativeTokenWrapperCallback() {
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
            if (new BigNumber(amount).isZero()) {
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
            const config = await Services.Ethereum.composeTransaction({
                from: account,
                value: amount,
                data: wrapperContract.methods.deposit().encodeABI(),
            }).catch((error) => {
                setTransactionState({
                    type: TransactionStateType.FAILED,
                    error,
                })
                throw error
            })

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
        [account, wrapperContract],
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
            if (all === false && new BigNumber(amount).isZero()) {
                setTransactionState({
                    type: TransactionStateType.FAILED,
                    error: new Error('Invalid withdraw amount'),
                })
                return
            }

            // error: insufficent weth balance
            if (all === false && new BigNumber(wethBalance).isLessThan(amount)) {
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

            const withdrawAmount = all ? wethBalance : amount
            const config = await Services.Ethereum.composeTransaction({
                from: account,
                data: wrapperContract.methods.withdraw(withdrawAmount).encodeABI(),
            }).catch((error) => {
                setTransactionState({
                    type: TransactionStateType.FAILED,
                    error,
                })
                throw error
            })

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
        [account, wrapperContract],
    )

    const resetCallback = useCallback(() => {
        setTransactionState({
            type: TransactionStateType.UNKNOWN,
        })
    }, [])

    return [transactionState, wrapCallback, unwrapCallback, resetCallback] as const
}
