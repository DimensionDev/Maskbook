import { TransactionStatusType } from '@masknet/web3-shared-base'
import type { TransactionReceipt } from '../types/index.js'

const falsy = [false, 0, 0n, '0', '0x', '0x0']
const truthy = [true, 1, 1n, '1', '0x1']
export function getTransactionStatusType(receipt: TransactionReceipt | null) {
    if (!receipt) return TransactionStatusType.NOT_DEPEND
    const status = receipt.status
    if (falsy.includes(status)) return TransactionStatusType.FAILED
    if (truthy.includes(status)) return TransactionStatusType.SUCCEED
    return TransactionStatusType.NOT_DEPEND
}
