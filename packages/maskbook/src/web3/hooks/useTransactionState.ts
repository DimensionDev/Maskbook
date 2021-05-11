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
    /** Workaround: ITO swapp fail due to unlucky*/
    ITO_UNLUCKY,
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
          error: Error & { code?: number }
      }
    | {
          type: TransactionStateType.ITO_UNLUCKY
          no: number
          receipt: TransactionReceipt
      }

export function useTransactionState() {
    return useState<TransactionState>({
        type: TransactionStateType.UNKNOWN,
    })
}
