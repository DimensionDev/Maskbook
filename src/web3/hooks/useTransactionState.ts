import { useState } from 'react'

export enum TransactionStateType {
    UNKNOWN,
    WAIT_FOR_CONFIRMING,
    SUCCEED,
    FAILED,
    REJECTED,
}

export type TransactionState =
    | {
          type: TransactionStateType.UNKNOWN
      }
    | {
          type: TransactionStateType.WAIT_FOR_CONFIRMING
      }
    | {
          type: TransactionStateType.SUCCEED
          hash: string
      }
    | {
          type: TransactionStateType.FAILED
          error: Error
      }

export function useTransactionState() {
    return useState<TransactionState>({
        type: TransactionStateType.UNKNOWN,
    })
}
