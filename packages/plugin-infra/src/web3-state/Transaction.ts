import type { Subscription } from 'use-subscription'
import { mapSubscription, mergeSubscription, StorageItem } from '@masknet/shared-base'
import {
    RecentTransaction,
    TransactionStatusType,
    TransactionState as Web3TransactionState,
} from '@masknet/web3-shared-base'
import type { Plugin } from '../types'

export type TransactionStorage<ChainId, Transaction> = Record<
    // @ts-ignore
    ChainId,
    Partial<
        Record<
            // address
            string,
            Array<RecentTransaction<ChainId, Transaction>>
        >
    >
>

export class TransactionState<ChainId, Transaction> implements Web3TransactionState<ChainId, Transaction> {
    static MAX_RECORD_SIZE = 20

    protected storage: StorageItem<TransactionStorage<ChainId, Transaction>> = null!
    public transactions?: Subscription<Array<RecentTransaction<ChainId, Transaction>>>

    constructor(
        protected context: Plugin.Shared.SharedContext,
        protected chainIds: ChainId[],
        protected subscriptions: {
            account?: Subscription<string>
            chainId?: Subscription<ChainId>
        },
        protected options: {
            formatAddress(a: string): string
        },
    ) {
        const defaultValue = Object.fromEntries(chainIds.map((x) => [x, {}])) as TransactionStorage<
            ChainId,
            Transaction
        >
        const { storage } = this.context.createKVStorage('persistent', {}).createSubScope('Transaction', {
            value: defaultValue,
        })
        this.storage = storage.value

        if (this.subscriptions.chainId && this.subscriptions.account) {
            this.transactions = mapSubscription(
                mergeSubscription(this.subscriptions.chainId, this.subscriptions.account, this.storage.subscription),
                ([chainId, account, transactionStorage]) =>
                    transactionStorage[chainId][this.options.formatAddress(account)] ?? [],
            )
        }
    }

    async addTransaction(chainId: ChainId, address: string, id: string, transaction: Transaction) {
        const now = new Date()
        const all = this.storage.value
        const address_ = this.options.formatAddress(address)

        // to ensure that the transaction doesn't exist
        const transaction_ = all[chainId][address_]?.find((x) => Object.keys(x.candidates).includes(id))
        if (transaction_) return

        const transactions: Array<RecentTransaction<ChainId, Transaction>> = [
            // new records go first then we will remove it last
            {
                id,
                indexId: id,
                chainId,
                createdAt: now,
                updatedAt: now,
                status: TransactionStatusType.NOT_DEPEND,
                candidates: {
                    [id]: transaction as Transaction,
                },
            },
            ...(all[chainId][address_] ?? []),
        ]

        await this.storage.setValue({
            ...all,
            // @ts-ignore
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
        const transaction_ = all[chainId][address_]?.find((x) => Object.keys(x.candidates).includes(id))
        if (!transaction_) return

        const transactions: Array<RecentTransaction<ChainId, Transaction>> = (all[chainId][address_] ?? []).map((x) =>
            Object.keys(x.candidates).includes(id)
                ? {
                      ...x,
                      indexId: newId,
                      candidates: {
                          ...x.candidates,
                          [newId]: transaction,
                      },
                      updatedAt: now,
                  }
                : x,
        )

        await this.storage.setValue({
            ...all,
            // @ts-ignore
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
        const transaction_ = all[chainId][address_]?.find((x) => Object.keys(x.candidates).includes(id))
        if (!transaction_) return

        const transactions: Array<RecentTransaction<ChainId, Transaction>> = (all[chainId][address_] ?? []).map((x) =>
            Object.keys(x.candidates).includes(id)
                ? {
                      ...x,
                      indexId: id,
                      status,
                      updatedAt: now,
                  }
                : x,
        )

        await this.storage.setValue({
            ...all,
            // @ts-ignore
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
            // @ts-ignore
            [chainId]: {
                ...all[chainId],
                [address_]: all[chainId][address_]?.filter((x) => !Object.keys(x.candidates).includes(id)),
            },
        })
    }

    async clearTransactions(chainId: ChainId, address: string) {
        const all = this.storage.value
        const address_ = this.options.formatAddress(address)

        await this.storage.setValue({
            ...all,
            // @ts-ignore
            [chainId]: {
                ...all[chainId],
                [address_]: [],
            },
        })
    }
}
