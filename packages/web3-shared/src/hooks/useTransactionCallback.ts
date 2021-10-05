import { useCallback } from 'react'
import type { PayableTransactionObject, PayableTx } from '@masknet/web3-contracts/types/types'
import { TransactionStateType, useTransactionState } from '.'
import { TransactionEventType } from '..'

export function useTransactionCallback<T extends unknown>(config?: PayableTx, method?: PayableTransactionObject<T>) {
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
                .on(TransactionEventType.TRANSACTION_HASH, (hash) => {
                    setState({
                        type: TransactionStateType.HASH,
                        hash,
                    })
                })
                .on(TransactionEventType.RECEIPT, (receipt) => {
                    setState({
                        type: TransactionStateType.CONFIRMED,
                        no: 0,
                        receipt,
                    })
                })
                .on(TransactionEventType.CONFIRMATION, (no, receipt) => {
                    setState({
                        type: TransactionStateType.CONFIRMED,
                        no,
                        receipt,
                    })
                    resolve()
                })
                .on(TransactionEventType.ERROR, (error) => {
                    setState({
                        type: TransactionStateType.FAILED,
                        error,
                    })
                    reject(error)
                })
        })
    }, [config, method])

    const resetCallback = useCallback(() => {
        setState({
            type: TransactionStateType.UNKNOWN,
        })
    }, [])

    return [state, updateCallback, resetCallback] as const
}
