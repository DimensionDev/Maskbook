import {
    ChainId,
    ComputedPayload,
    EthereumTransactionConfig,
    getReceiptStatus,
    TransactionStatusType,
} from '@masknet/web3-shared-evm'
import * as database from './database'

export interface RecentTransactionOptions {
    status?: TransactionStatusType
    computedPayload?: boolean
}

export interface RecentTransaction {
    at: Date
    hash: string
    status: TransactionStatusType
    candidates: Record<string, EthereumTransactionConfig>
    computedPayload?: ComputedPayload
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

export async function updateRecentTransaction(
    chainId: ChainId,
    address: string,
    hash: string,
    status: TransactionStatusType.SUCCEED | TransactionStatusType.FAILED | TransactionStatusType.CANCELLED,
) {
    await database.updateRecentTransaction(chainId, address, hash, status)
}

export async function clearRecentTransactions(chainId: ChainId, address: string) {
    await database.clearRecentTransactions(chainId, address)
}

export async function getRecentTransactions(
    chainId: ChainId,
    address: string,
    options?: RecentTransactionOptions,
): Promise<RecentTransaction[]> {
    const transactions = await database.getRecentTransactions(chainId, address)
    const allSettled = await Promise.allSettled(
        transactions.map<Promise<RecentTransaction>>(async ({ at, hash, status, candidates }) => {
            const tx: RecentTransaction = {
                at,
                hash,
                status,
                candidates,
            }

            if (tx.status === TransactionStatusType.NOT_DEPEND) {
                try {
                    const candidates_ = Object.entries(candidates)
                    for await (const [hash] of candidates_) {
                        const receipt = await getTransactionReceiptHijacked(hash)
                        if (!receipt) continue
                        tx.hash = receipt.transactionHash
                        tx.status = getReceiptStatus(receipt)
                        break
                    }
                    candidates_.forEach(([hash, config]) =>
                        tx.status === TransactionStatusType.NOT_DEPEND
                            ? watchTransaction(hash, config)
                            : unwatchTransaction(hash, config),
                    )
                } catch {
                    // do nothing
                }
            }

            if (options?.computedPayload) {
                tx.computedPayload = await getSendTransactionComputedPayload(tx.candidates[tx.hash])
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
