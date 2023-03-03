import type { TransactionReceipt } from 'web3-core'
import { TransactionStatusType } from '@masknet/web3-shared-base'

export function getReceiptStatus(receipt: TransactionReceipt | null) {
    if (!receipt) return TransactionStatusType.NOT_DEPEND
    const status = receipt.status as unknown as string
    if (receipt.status === false || ['0', '0x', '0x0'].includes(status)) return TransactionStatusType.FAILED
    if (receipt.status === true || ['1', '0x1'].includes(status)) return TransactionStatusType.SUCCEED
    return TransactionStatusType.NOT_DEPEND
}
