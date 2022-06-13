import { omit } from 'lodash-unified'
import type { Subscription } from 'use-subscription'
import { Emitter } from '@servie/events'
import { getSubscriptionCurrentValue, StorageItem } from '@masknet/shared-base'
import {
    TransactionChecker,
    TransactionStatusType,
    WatchEvents,
    TransactionWatcherState as Web3TransactionWatcherState,
    RecentTransaction,
} from '@masknet/web3-shared-base'
import type { Plugin } from '../types'

interface TransactionWatcherItem<ChainId, Transaction> {
    at: number
    id: string
    chainId: ChainId
    status: TransactionStatusType
    transaction: Transaction
}

type TransactionWatcher<ChainId, Transaction> = Record<
    // @ts-ignore
    ChainId,
    Record<
        // transaction id
        string,
        TransactionWatcherItem<ChainId, Transaction>
    >
>

class Watcher<ChainId, Transaction> {
    static MAX_ITEM_SIZE = 40

    private timer: NodeJS.Timeout | null = null

    constructor(
        protected storage: StorageItem<TransactionWatcher<ChainId, Transaction>>,
        protected checkers: Array<TransactionChecker<ChainId>>,
        protected options: {
            checkDelay: number
            getTransactionCreator: (transaction: Transaction) => string
            onNotify: (id: string, status: TransactionStatusType, transaction: Transaction) => void
        },
    ) {}

    private getStorage(chainId: ChainId) {
        return this.storage.value[chainId]
    }

    private async setStorage(chainId: ChainId, id: string, item: TransactionWatcherItem<ChainId, Transaction>) {
        await this.storage.setValue({
            ...this.storage.value,
            // @ts-ignore
            [chainId]: {
                ...this.storage.value[chainId],
                [item.id]: item,
            },
        })
    }

    private async deleteStorage(chainId: ChainId, id: string) {
        await this.storage.setValue({
            ...this.storage.value,
            // @ts-ignore
            [chainId]: omit(this.storage.value[chainId], [id]),
        })
    }

    private async setTransaction(
        chainId: ChainId,
        id: string,
        transaction: TransactionWatcherItem<ChainId, Transaction>,
    ) {
        await this.setStorage(chainId, id, transaction)
    }

    private async removeTransaction(chainId: ChainId, id: string) {
        await this.deleteStorage(chainId, id)
    }

    private getAllTransactions(chainId: ChainId) {
        const storage = this.getStorage(chainId)
        return storage ? [...Object.entries(storage)].sort(([, a], [, z]) => z.at - a.at) : []
    }

    private getWatched(chainId: ChainId) {
        return this.getAllTransactions(chainId).slice(0, Watcher.MAX_ITEM_SIZE)
    }

    private getUnwatched(chainId: ChainId) {
        return this.getAllTransactions(chainId).slice(Watcher.MAX_ITEM_SIZE)
    }

    private async check(chainId: ChainId) {
        // stop any pending task
        this.stopCheck()

        // unwatch legacy transactions
        for (const [id] of this.getUnwatched(chainId)) {
            await this.unwatchTransaction(chainId, id)
        }

        // check if all transactions were sealed
        const watchedTransactions = this.getWatched(chainId).filter(
            ([, x]) => x.status === TransactionStatusType.NOT_DEPEND,
        )
        if (!watchedTransactions.length) return

        for (const [id, { transaction }] of watchedTransactions) {
            for (const checker of this.checkers) {
                try {
                    const status = await checker.checkStatus(
                        id,
                        chainId,
                        this.options.getTransactionCreator(transaction),
                    )
                    if (status !== TransactionStatusType.NOT_DEPEND) {
                        this.removeTransaction(chainId, id)
                        this.options.onNotify(id, status, transaction)
                    }
                } catch (error) {
                    console.warn('Failed to check transaction status.')
                }
            }
        }

        // kick to the next round
        this.startCheck(chainId)
    }

    public startCheck(chainId: ChainId) {
        this.stopCheck()
        if (this.timer === null) {
            this.timer = setTimeout(this.check.bind(this, chainId), this.options.checkDelay)
        }
    }

    public stopCheck() {
        if (this.timer !== null) clearTimeout(this.timer)
        this.timer = null
    }

    public async watchTransaction(chainId: ChainId, id: string, transaction: Transaction) {
        await this.setTransaction(chainId, id, {
            at: Date.now(),
            id,
            chainId,
            status: TransactionStatusType.NOT_DEPEND,
            transaction,
        })
        this.startCheck(chainId)
    }

    public async unwatchTransaction(chainId: ChainId, id: string) {
        await this.removeTransaction(chainId, id)
    }
}

export class TransactionWatcherState<ChainId, Transaction>
    implements Web3TransactionWatcherState<ChainId, Transaction>
{
    protected storage: StorageItem<TransactionWatcher<ChainId, Transaction>> = null!
    private watchers: Map<ChainId, Watcher<ChainId, Transaction>> = new Map()

    emitter: Emitter<WatchEvents<Transaction>> = new Emitter()

    constructor(
        protected context: Plugin.Shared.SharedContext,
        protected chainIds: ChainId[],
        protected checkers: Array<TransactionChecker<ChainId>>,
        protected subscriptions: {
            chainId?: Subscription<ChainId>
            transactions?: Subscription<Array<RecentTransaction<ChainId, Transaction>>>
        },
        protected options: {
            /** Default block delay in seconds */
            defaultBlockDelay: number
            /** Get the author address */
            getTransactionCreator: (transaction: Transaction) => string
        },
    ) {
        const defaultValue = Object.fromEntries(chainIds.map((x) => [x, {}])) as TransactionWatcher<
            ChainId,
            Transaction
        >
        const { storage } = this.context.createKVStorage('memory', {}).createSubScope('TransactionWatcher', {
            value: defaultValue,
        })

        this.storage = storage.value

        const resume = async () => {
            const chainId = this.subscriptions.chainId?.getCurrentValue()
            if (chainId) this.resumeWatcher(chainId)

            const transactions = this.subscriptions.transactions?.getCurrentValue() ?? []
            for (const transaction of transactions) {
                for (const [id, tx] of Object.entries(transaction.candidates)) {
                    if (transaction.status === TransactionStatusType.NOT_DEPEND)
                        await this.watchTransaction(transaction.chainId, id, tx)
                }
            }
        }

        // resume watcher if chain id changed
        if (this.subscriptions.chainId) {
            this.subscriptions.chainId.subscribe(() => resume())

            getSubscriptionCurrentValue(() => {
                return this.subscriptions.chainId
            }).then(() => {
                resume()
            })
        }

        // add external transactions at startup
        if (this.subscriptions.transactions) {
            getSubscriptionCurrentValue(() => {
                return this.subscriptions.transactions
            }).then(() => {
                resume()
            })
        }
    }

    private getWatcher(chainId: ChainId) {
        if (!this.watchers.has(chainId))
            this.watchers.set(
                chainId,
                new Watcher(this.storage, this.checkers, {
                    checkDelay: this.options.defaultBlockDelay * 1000,
                    getTransactionCreator: this.options.getTransactionCreator,
                    onNotify: this.notifyTransaction.bind(this),
                }),
            )
        return this.watchers.get(chainId)!
    }

    private resumeWatcher(chainId: ChainId) {
        const watcher = this.getWatcher(chainId)
        watcher.startCheck(chainId)
    }

    async watchTransaction(chainId: ChainId, id: string, transaction: Transaction) {
        await this.getWatcher(chainId).watchTransaction(chainId, id, transaction)
        this.emitter.emit('progress', id, TransactionStatusType.NOT_DEPEND, transaction)
    }

    async unwatchTransaction(chainId: ChainId, id: string) {
        await this.getWatcher(chainId).unwatchTransaction(chainId, id)
    }

    notifyTransaction(id: string, status: TransactionStatusType, transaction: Transaction) {
        this.emitter.emit('progress', id, status, transaction)
    }
}
