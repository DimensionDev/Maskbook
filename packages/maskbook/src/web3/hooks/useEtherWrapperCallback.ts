import { useCallback } from 'react'
import BigNumber from 'bignumber.js'
import type { Tx } from '@dimensiondev/contracts/types/types'
import { useEtherWrapperContract } from '../contracts/useWrappedEtherContract'
import { addGasMargin } from '../helpers'
import { useAccount } from './useAccount'
import { TransactionStateType, useTransactionState } from './useTransactionState'

export function useEtherWrapperCallback() {
    const account = useAccount()
    const wrapperContract = useEtherWrapperContract()
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

            // step 1: start waiting for provider to confirm tx
            setTransactionState({
                type: TransactionStateType.WAIT_FOR_CONFIRMING,
            })

            const config: Tx = {
                from: account,
                value: amount,
            }

            // step 2: estimate gas
            const estimatedGas = await wrapperContract.methods
                .deposit()
                .estimateGas(config)
                .catch((error) => {
                    setTransactionState({
                        type: TransactionStateType.FAILED,
                        error,
                    })
                    throw error
                })

            // step 3: blocking
            wrapperContract.methods.deposit().send(
                {
                    gas: addGasMargin(estimatedGas).toFixed(),
                    ...config,
                },
                (error, hash) => {
                    if (error) {
                        setTransactionState({
                            type: TransactionStateType.FAILED,
                            error,
                        })
                        return
                    }
                    setTransactionState({
                        type: TransactionStateType.HASH,
                        hash,
                    })
                },
            )
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

            // step 1: start waiting for provider to confirm tx
            setTransactionState({
                type: TransactionStateType.WAIT_FOR_CONFIRMING,
            })

            const config: Tx = {
                from: account,
            }
            const withdrawAmount = all ? wethBalance : amount

            // step 2: estimate gas
            const estimatedGas = await wrapperContract.methods
                .withdraw(withdrawAmount)
                .estimateGas(config)
                .catch((error) => {
                    setTransactionState({
                        type: TransactionStateType.FAILED,
                        error,
                    })
                    throw error
                })

            // step 3: blocking
            wrapperContract.methods.withdraw(withdrawAmount).send(
                {
                    gas: addGasMargin(estimatedGas).toFixed(),
                    ...config,
                },
                (error, hash) => {
                    if (error) {
                        setTransactionState({
                            type: TransactionStateType.FAILED,
                            error,
                        })
                        return
                    }
                    setTransactionState({
                        type: TransactionStateType.HASH,
                        hash,
                    })
                },
            )
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
