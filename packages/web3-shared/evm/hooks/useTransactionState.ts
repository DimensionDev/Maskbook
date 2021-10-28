import { useState, useCallback } from 'react'
import type { TransactionReceipt } from 'web3-core'
import { isNextStateAvailable } from '..'

export enum TransactionStateType {
    UNKNOWN = 0,
    /** Wait for external provider */
    WAIT_FOR_CONFIRMING = 1,
    /** Hash is available */
    HASH = 2,
    /** Receipt is available */
    RECEIPT = 3,
    /** Confirmed or Reverted */
    CONFIRMED = 4,
    /** Fail to send */
    FAILED = 5,
}

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
            if (!isNextStateAvailable(state.type, nextState.type)) return
            setState(nextState)
        },
        [state],
    )
    return [state, setStateWithConfirmation] as const
}
