import { useState } from 'react'
import type { TransactionReceipt } from 'web3-core'

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
    /** Reject by external provider */
    REJECTED = 6,
}

export type TransactionState =
    | {
          type: TransactionStateType.UNKNOWN
      }
    | {
          type: TransactionStateType.WAIT_FOR_CONFIRMING
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
      }

export function useTransactionState() {
    return useState<TransactionState>({
        type: TransactionStateType.UNKNOWN,
    })
}
