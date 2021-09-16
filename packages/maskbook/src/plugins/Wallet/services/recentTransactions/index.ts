import type { TransactionReceipt } from 'web3-core'
import type { JsonRpcPayload } from 'web3-core-helpers'
import { TransactionStatusType } from '@masknet/web3-shared'
import { getSendTransactionComputedPayload } from '../../../../extension/background-script/EthereumService'
import * as database from './database'
import * as watcher from './watcher'

function getReceiptStatus(receipt: TransactionReceipt | null) {
    if (!receipt) return TransactionStatusType.NOT_DEPEND
    const status = receipt.status as unknown as string
    if (receipt.status === false || ['0x', '0x0'].includes(status)) return TransactionStatusType.FAILED
    if (receipt.status === true || ['0x1'].includes(status)) return TransactionStatusType.SUCCEED
    return TransactionStatusType.NOT_DEPEND
}

export interface RecentTransaction {
    at: Date
    hash: string
    status: TransactionStatusType
    receipt?: TransactionReceipt | null
    payload?: JsonRpcPayload
    computedPayload?: UnboxPromise<ReturnType<typeof getSendTransactionComputedPayload>>
}

export async function addRecentTransaction(address: string, hash: string, payload: JsonRpcPayload) {
    watcher.watchTransaction(hash)
    await database.addRecentTransaction(address, hash, payload)
}

export async function removeRecentTransaction(address: string, hash: string) {
    watcher.unwatchTransaction(hash)
    await database.removeRecentTransaction(address, hash)
}

export async function clearRecentTransactions(address: string) {
    const transactions = await database.getRecentTransactions(address)
    transactions.forEach((x) => watcher.unwatchTransaction(x.hash))
    await database.clearRecentTransactions(address)
}

export async function getRecentTransactionList(address: string): Promise<RecentTransaction[]> {
    const transactions = await database.getRecentTransactions(address)
    const allSettled = await Promise.allSettled(
        transactions.map<Promise<RecentTransaction>>(async ({ at, hash, payload }) => {
            watcher.watchTransaction(hash)
            const receipt = await watcher.getReceipt(hash)
            return {
                at,
                hash,
                status: getReceiptStatus(receipt),
                receipt,
                payload,
                computedPayload: await getSendTransactionComputedPayload(payload),
            }
        }),
    )

    // compose result
    const transaction_: RecentTransaction[] = []
    allSettled.forEach((x) => (x.status === 'fulfilled' ? transaction_.push(x.value) : undefined))
    return transaction_
}
