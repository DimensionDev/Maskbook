import { useCallback } from 'react'
import type { PayableTransactionObject, PayableTx } from '@masknet/web3-contracts/types/types'
import { TransactionStateType, useTransactionState } from '.'
import { TransactionEventType } from '..'

export function useTransactionCallback<T extends unknown>(
    type: TransactionStateType.HASH | TransactionStateType.RECEIPT | TransactionStateType.CONFIRMED,
    config: PayableTx | undefined,
    method: PayableTransactionObject<T> | undefined,
) {
    const [state, setState] = useTransactionState()

    const updateCallback = useCallback(async () => {
        if (!config || !method) {
            setState({
                type: TransactionStateType.UNKNOWN,
            })
            return
        }

        setState({
            type: TransactionStateType.WAIT_FOR_CONFIRMING,
        })

        try {
            await method.estimateGas(config)
        } catch (error) {
            try {
                await method.call(config)
            } catch (error) {
                setState({
                    type: TransactionStateType.FAILED,
                    error: error instanceof Error ? error : new Error('Unknown Error.'),
                })
                throw error
            }
        }

        return new Promise<void>(async (resolve, reject) => {
            method
                .send(config)
                .once(TransactionEventType.TRANSACTION_HASH, (hash) => {
                    if (type !== TransactionStateType.HASH) return
                    setState({
                        type: TransactionStateType.HASH,
                        hash,
                    })
                    resolve()
                })
                .once(TransactionEventType.RECEIPT, (receipt) => {
                    if (type !== TransactionStateType.RECEIPT) return
                    setState({
                        type: TransactionStateType.RECEIPT,
                        receipt,
                    })
                    resolve()
                })
                .once(TransactionEventType.CONFIRMATION, (no, receipt) => {
                    if (type !== TransactionStateType.CONFIRMED) return
                    setState({
                        type: TransactionStateType.CONFIRMED,
                        no,
                        receipt,
                    })
                    resolve()
                })
                .once(TransactionEventType.ERROR, (error) => {
                    setState({
                        type: TransactionStateType.FAILED,
                        error,
                    })
                    reject(error)
                })
        })
    }, [type, config, method])

    const resetCallback = useCallback(() => {
        setState({
            type: TransactionStateType.UNKNOWN,
        })
    }, [])

    return [state, updateCallback, resetCallback] as const
}
