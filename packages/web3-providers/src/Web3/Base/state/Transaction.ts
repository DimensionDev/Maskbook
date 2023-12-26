import type { Subscription } from 'use-subscription'
import { mapSubscription, mergeSubscription, type StorageItem } from '@masknet/shared-base'
import {
    type RecentTransaction,
    TransactionStatusType,
    type TransactionState as Web3TransactionState,
} from '@masknet/web3-shared-base'

export type TransactionStorage<ChainId extends PropertyKey, Transaction> = Record<
    ChainId,
    | Record<
          // address
          string,
          Array<RecentTransaction<ChainId, Transaction>>
      >
    | undefined
>

export abstract class TransactionState<ChainId extends PropertyKey, Transaction>
    implements Web3TransactionState<ChainId, Transaction>
{
    static MAX_RECORD_SIZE = 20
    public transactions?: Subscription<Array<RecentTransaction<ChainId, Transaction>>>

    constructor(
        private subscriptions: {
            account?: Subscription<string>
            chainId?: Subscription<ChainId>
        },
        private options: {
            formatAddress(a: string): string
            isValidChainId(chainId?: ChainId): boolean
        },
        private storage: StorageItem<TransactionStorage<ChainId, Transaction>>,
    ) {
        if (!storage.initialized) throw new Error('Storage not initialized')
        if (this.subscriptions.chainId && this.subscriptions.account) {
            this.transactions = mapSubscription(
                mergeSubscription(this.subscriptions.chainId, this.subscriptions.account, this.storage.subscription),
                ([chainId, account, transactionStorage]) => {
                    if (!this.options.isValidChainId(chainId)) return []
                    return transactionStorage[chainId]?.[this.options.formatAddress(account)] ?? []
                },
            )
        }
    }
    async getTransaction(chainId: ChainId, address: string, id: string): Promise<Transaction | undefined> {
        const all = this.storage.value
        const address_ = this.options.formatAddress(address)

        for (const recentTransaction of all[chainId]?.[address_] ?? []) {
            for (const [id_, transaction] of Object.entries(recentTransaction.candidates)) {
                if (id_ === id) return transaction
            }
        }
        return
    }

    async addTransaction(
        chainId: ChainId,
        address: string,
        id: string,
        transaction: Transaction & { draftedAt: Date },
    ) {
        const now = new Date()
        const all = this.storage.value
        const address_ = this.options.formatAddress(address)

        // to ensure that the transaction doesn't exist
        const transaction_ = all[chainId]?.[address_]?.find((x) => Object.keys(x.candidates).includes(id))
        if (transaction_) return

        const transactions: Array<RecentTransaction<ChainId, Transaction>> = [
            // new records go first then we will remove it last
            {
                id,
                indexId: id,
                chainId,
                draftedAt: transaction.draftedAt,
                createdAt: now,
                updatedAt: now,
                status: TransactionStatusType.NOT_DEPEND,
                candidates: {
                    [id]: transaction,
                },
            },
            ...(all[chainId]?.[address_] ?? []),
        ]

        await this.storage.setValue({
            ...all,
            [chainId]: {
                ...all[chainId],
                [address_]: transactions.slice(0, TransactionState.MAX_RECORD_SIZE),
            },
        })
    }

    async replaceTransaction(chainId: ChainId, address: string, id: string, newId: string, transaction: Transaction) {
        const now = new Date()
        const all = this.storage.value
        const address_ = this.options.formatAddress(address)

        // to ensure that the transaction exists
        const transaction_ = all[chainId]?.[address_]?.find((x) => Object.keys(x.candidates).includes(id))
        if (!transaction_) return

        const transactions: Array<RecentTransaction<ChainId, Transaction>> = (all[chainId]?.[address_] ?? []).map(
            (x) =>
                Object.keys(x.candidates).includes(id) ?
                    {
                        ...x,
                        indexId: newId,
                        candidates: {
                            ...x.candidates,
                            [newId]: transaction,
                        },
                        updatedAt: now,
                    }
                :   x,
        )

        await this.storage.setValue({
            ...all,
            [chainId]: {
                ...all[chainId],
                [address_]: transactions,
            },
        })
    }

    async updateTransaction(
        chainId: ChainId,
        address: string,
        id: string,
        status: Exclude<TransactionStatusType, TransactionStatusType.NOT_DEPEND>,
    ) {
        const now = new Date()
        const all = this.storage.value
        const address_ = this.options.formatAddress(address)

        // to ensure that the transaction exists
        const transaction_ = all[chainId]?.[address_]?.find((x) => Object.keys(x.candidates).includes(id))
        if (!transaction_) return

        const transactions: Array<RecentTransaction<ChainId, Transaction>> = (all[chainId]?.[address_] ?? []).map(
            (x) =>
                Object.keys(x.candidates).includes(id) ?
                    {
                        ...x,
                        indexId: id,
                        status,
                        updatedAt: now,
                    }
                :   x,
        )

        await this.storage.setValue({
            ...all,
            [chainId]: {
                ...all[chainId],
                [address_]: transactions,
            },
        })
    }

    async removeTransaction(chainId: ChainId, address: string, id: string) {
        const all = this.storage.value
        const address_ = this.options.formatAddress(address)

        await this.storage.setValue({
            ...all,
            [chainId]: {
                ...all[chainId],
                [address_]: all[chainId]?.[address_]?.filter((x) => !Object.keys(x.candidates).includes(id)),
            },
        })
    }

    async getTransactions(chainId: ChainId, address: string): Promise<Array<RecentTransaction<ChainId, Transaction>>> {
        const all = this.storage.value
        const address_ = this.options.formatAddress(address)

        return all[chainId]?.[address_] ?? []
    }

    async clearTransactions(chainId: ChainId, address: string) {
        const all = this.storage.value
        const address_ = this.options.formatAddress(address)

        await this.storage.setValue({
            ...all,
            [chainId]: {
                ...all[chainId],
                [address_]: [],
            },
        })
    }
}
