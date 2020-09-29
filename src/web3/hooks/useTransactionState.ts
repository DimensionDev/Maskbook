import { useState } from 'react'
import type { TransactionReceipt } from 'web3-core'

export enum TransactionStateType {
    UNKNOWN,
    /** Wait for external provider */
    WAIT_FOR_CONFIRMING,
    /** Hash is available */
    HASH,
    /** Receipt is available */
    RECEIPT,
    /** Confirmed */
    CONFIRMED,
    /** Fail to send */
    FAILED,
    /** Reject by external provider */
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
