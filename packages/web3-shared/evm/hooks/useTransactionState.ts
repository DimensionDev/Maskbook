import { useReducer } from 'react'
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

function txStateReducer(state: TransactionState, nextState: TransactionState) {
    const changeable = isNextStateAvailable(state.type, nextState.type)
    return changeable ? nextState : state
}

export function useTransactionState() {
    return useReducer(txStateReducer, {
        type: TransactionStateType.UNKNOWN,
    })
}
