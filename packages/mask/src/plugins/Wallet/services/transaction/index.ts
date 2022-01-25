import type { TransactionReceipt } from 'web3-core'
import type { JsonRpcPayload } from 'web3-core-helpers'
import type { ChainId, TransactionStatusType } from '@masknet/web3-shared-evm'
import { getSendTransactionComputedPayload } from '../../../../extension/background-script/EthereumService'
import * as database from './database'
import * as watcher from './watcher'
import * as helpers from './helpers'

export * from './progress'
export * from './watcher'

export interface RecentTransaction {
    at: Date
    hash: string
    hashReplacement?: string
    status: TransactionStatusType
    receipt?: TransactionReceipt | null
    payload?: JsonRpcPayload
    payloadReplacement?: JsonRpcPayload
    computedPayload?: UnboxPromise<ReturnType<typeof getSendTransactionComputedPayload>>
}

export async function addRecentTransaction(chainId: ChainId, address: string, hash: string, payload: JsonRpcPayload) {
    await database.addRecentTransaction(chainId, address, hash, payload)
}

export async function removeRecentTransaction(chainId: ChainId, address: string, hash: string) {
    await database.removeRecentTransaction(chainId, address, hash)
}

export async function replaceRecentTransaction(
    chainId: ChainId,
    address: string,
    hash: string,
    newHash: string,
    payload: JsonRpcPayload,
) {
    await database.replaceRecentTransaction(chainId, address, hash, newHash, payload)
}

export async function clearRecentTransactions(chainId: ChainId, address: string) {
    await database.clearRecentTransactions(chainId, address)
}

export async function getRecentTransaction(chainId: ChainId, address: string, hash: string) {
    const transactions = await getRecentTransactions(chainId, address)
    return transactions.find((x) => x.hash === hash)
}

export async function getRecentTransactions(chainId: ChainId, address: string): Promise<RecentTransaction[]> {
    const transactions = await database.getRecentTransactions(chainId, address)
    const allSettled = await Promise.allSettled(
        transactions.map<Promise<RecentTransaction>>(
            async ({ at, hash, hashReplacement, payload, payloadReplacement }) => {
                const receipt =
                    (await watcher.getReceipt(chainId, hash)) ||
                    (await (hashReplacement ? watcher.getReceipt(chainId, hashReplacement) : null))

                // if it cannot found receipt, then start the watching progress
                // in case the user just refreshed the background page
                if (!receipt) {
                    watcher.watchTransaction(chainId, hash, payload)
                    if (hashReplacement && payloadReplacement)
                        watcher.watchTransaction(chainId, hashReplacement, payloadReplacement)
                }

                return {
                    at,
                    hash,
                    hashReplacement,
                    status: helpers.getReceiptStatus(receipt),
                    receipt,
                    payload,
                    payloadReplacement,
                    computedPayload: await getSendTransactionComputedPayload(payloadReplacement ?? payload),
                }
            },
        ),
    )

    // compose result
    const transaction_: RecentTransaction[] = []
    allSettled.forEach((x) => (x.status === 'fulfilled' ? transaction_.push(x.value) : undefined))
    return transaction_
}
