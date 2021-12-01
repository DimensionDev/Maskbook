import { useState, useCallback } from 'react'
import type { TransactionReceipt } from 'web3-core'
import { TransactionStateType } from '../types'
import { isNextStateAvailable } from '../utils'

export type TransactionState =
    | {
          type: TransactionStateType.UNKNOWN
      }
    | {
          type: TransactionStateType.WAIT_FOR_CONFIRMING

          // @deprecated don't depend on this property will be removed in the future
          hash?: string
      }
    | {
          type: TransactionStateType.HASH
          hash: string
      }
    | {
          type: TransactionStateType.RECEIPT
          receipt: TransactionReceipt
      }
    | {
          type: TransactionStateType.CONFIRMED
          no: number
          receipt: TransactionReceipt
          reason?: string
      }
    | {
          type: TransactionStateType.FAILED
          error: Error & { code?: number }
          receipt?: TransactionReceipt
      }

export function useTransactionState() {
    const [state, setState] = useState<TransactionState>({
        type: TransactionStateType.UNKNOWN,
    })
    const setStateWithConfirmation = useCallback(
        (nextState: TransactionState) => {
            if (nextState.type === TransactionStateType.UNKNOWN || isNextStateAvailable(state.type, nextState.type))
                setState(nextState)
        },
        [state],
    )
    return [state, setStateWithConfirmation] as const
}
