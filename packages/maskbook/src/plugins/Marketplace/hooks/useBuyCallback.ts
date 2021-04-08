import { useCallback, useState } from 'react'
import { TransactionStateType, useTransactionState } from '../../../web3/hooks/useTransactionState'

export function useBuyCallback() {
    const [transactionState, setTransactionState] = useTransactionState()

    const buyCallback = useCallback(() => {}, [])

    const resetCallback = useCallback(() => {
        setTransactionState({
            type: TransactionStateType.UNKNOWN,
        })
    }, [])

    return [transactionState, buyCallback, resetCallback] as const
}
