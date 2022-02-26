import type { TransactionReceipt } from 'web3-core'
import { ChainId, EthereumTransactionConfig, getReceiptStatus, TransactionStatusType } from '@masknet/web3-shared-evm'
import {
    getSendTransactionComputedPayload,
    watchTransaction,
    unwatchTransaction,
    getTransactionReceiptHijacked,
} from '../../../../extension/background-script/EthereumService'
import * as database from './database'

export interface RecentTransactionOptions {
    status?: TransactionStatusType
    receipt?: boolean
    computedPayload?: boolean
}

export interface RecentTransaction {
    at: Date
    hash: string
    config: EthereumTransactionConfig
    status: TransactionStatusType
    candidates: Record<string, EthereumTransactionConfig>
    receipt?: TransactionReceipt | null
    computedPayload?: UnboxPromise<ReturnType<typeof getSendTransactionComputedPayload>>
}

export async function addRecentTransaction(
    chainId: ChainId,
    address: string,
    hash: string,
    config: EthereumTransactionConfig,
) {
    await database.addRecentTransaction(chainId, address, hash, config)
}

export async function removeRecentTransaction(chainId: ChainId, address: string, hash: string) {
    await database.removeRecentTransaction(chainId, address, hash)
}

export async function replaceRecentTransaction(
    chainId: ChainId,
    address: string,
    hash: string,
    newHash: string,
    newConfig: EthereumTransactionConfig,
) {
    await database.replaceRecentTransaction(chainId, address, hash, newHash, newConfig)
}

export async function clearRecentTransactions(chainId: ChainId, address: string) {
    await database.clearRecentTransactions(chainId, address)
}

export async function getRecentTransaction(
    chainId: ChainId,
    address: string,
    hash: string,
    options?: RecentTransactionOptions,
) {
    const transactions = await getRecentTransactions(chainId, address, options)
    return transactions.find((x) => x.hash === hash)
}

export async function getRecentTransactions(
    chainId: ChainId,
    address: string,
    options?: RecentTransactionOptions,
): Promise<RecentTransaction[]> {
    const transactions = await database.getRecentTransactions(chainId, address)
    const allSettled = await Promise.allSettled(
        transactions.map<Promise<RecentTransaction>>(async ({ at, hash, config, candidates }) => {
            const tx: RecentTransaction = {
                at,
                hash,
                config,
                status: getReceiptStatus(null),
                receipt: null,
                candidates,
            }
            const pairs = Object.entries(candidates).map(([hash, config]) => ({ hash, config }))

            try {
                for await (const pair of pairs) {
                    const receipt = await getTransactionReceiptHijacked(pair.hash)
                    if (!receipt) continue

                    tx.hash = pair.hash
                    tx.config = pair.config
                    tx.receipt = receipt
                    break
                }
            } catch {
                // do nothing
            } finally {
                if (tx.receipt) {
                    pairs.forEach((x) => {
                        if (x.hash !== tx.receipt?.transactionHash) unwatchTransaction(x.hash)
                    })
                } else {
                    pairs.forEach((x) => watchTransaction(x.hash, x.config))
                }
            }

            if (options?.receipt) delete tx.receipt
            if (options?.computedPayload) {
                tx.computedPayload = await getSendTransactionComputedPayload(tx.config)
            }

            return tx
        }),
    )

    // compose result
    const transaction_: RecentTransaction[] = []
    allSettled.forEach((x) =>
        x.status === 'fulfilled' && (typeof options?.status !== 'undefined' ? x.value.status === options?.status : true)
            ? transaction_.push(x.value)
            : undefined,
    )
    return transaction_
}
