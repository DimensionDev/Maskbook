import { TransactionStatusType } from '@masknet/web3-shared-base'
import type { TransactionReceipt } from '../types/index.js'

export function getTransactionStatusType(receipt: TransactionReceipt | null) {
    if (!receipt) return TransactionStatusType.NOT_DEPEND
    if (isTransactionReceiptFailed(receipt)) return TransactionStatusType.FAILED
    if (isTransactionReceiptSuccess(receipt)) return TransactionStatusType.SUCCEED
    return TransactionStatusType.NOT_DEPEND
}

export function isTransactionReceiptSuccess(receipt: Pick<TransactionReceipt, 'status'> | null | undefined) {
    if (!receipt) return false
    const rawStatus = receipt.status as unknown
    return rawStatus === true || ['1', '0x1', 'success'].includes(String(rawStatus))
}

export function isTransactionReceiptFailed(receipt: Pick<TransactionReceipt, 'status'> | null | undefined) {
    if (!receipt) return false
    const rawStatus = receipt.status as unknown
    return rawStatus === false || ['0', '0x', '0x0', 'reverted'].includes(String(rawStatus))
}
