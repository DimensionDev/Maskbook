import { omit } from 'lodash-es'
import type { Subscription } from 'use-subscription'
import { Emitter } from '@servie/events'
import type { JsonRpcPayload } from 'web3-core-helpers'
import { getSubscriptionCurrentValue, type StorageItem } from '@masknet/shared-base'
import {
    type TransactionChecker,
    TransactionStatusType,
    type WatchEvents,
    type TransactionWatcherState as Web3TransactionWatcherState,
    type RecentTransaction,
    type RecognizableError,
} from '@masknet/web3-shared-base'
import type { Plugin } from '@masknet/plugin-infra'

interface TransactionWatcherItem<ChainId, Transaction> {
    at: number
    id: string
    chainId: ChainId
    status: TransactionStatusType
    transaction: Transaction
}

type TransactionWatcher<ChainId extends PropertyKey, Transaction> = Record<
    ChainId,
    Record<
        // transaction id
        string,
        TransactionWatcherItem<ChainId, Transaction>
    >
>

class Watcher<ChainId extends PropertyKey, Transaction> {
    static MAX_ITEM_SIZE = 40

    private timer: NodeJS.Timeout | null = null

    constructor(
        protected storage: StorageItem<TransactionWatcher<ChainId, Transaction>>,
        protected checkers: Array<TransactionChecker<ChainId, Transaction>>,
        protected options: {
            delay: number
            onNotify: (chainId: ChainId, id: string, transaction: Transaction, status: TransactionStatusType) => void
        },
    ) {}

    private getStorage(chainId: ChainId) {
        return this.storage.value[chainId]
    }

    private async setStorage(chainId: ChainId, id: string, item: TransactionWatcherItem<ChainId, Transaction>) {
        await this.storage.setValue({
            ...this.storage.value,
            [chainId]: {
                ...this.getStorage(chainId),
                [item.id]: item,
            },
        })
    }

    private async deleteStorage(chainId: ChainId, id: string) {
        await this.storage.setValue({
            ...this.storage.value,
            [chainId]: omit(this.getStorage(chainId), [id]),
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

    /**
     * Get all watched transactions.
     * @param chainId
     * @returns
     */
    private getWatched(chainId: ChainId) {
        return this.getAllTransactions(chainId).slice(0, Watcher.MAX_ITEM_SIZE)
    }

    /**
     * Get all unwatched transactions.
     * @param chainId
     * @returns
     */
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
            ([, { status }]) => status === TransactionStatusType.NOT_DEPEND,
        )
        if (!watchedTransactions.length) return

        for (const [id, { transaction }] of watchedTransactions) {
            for (const checker of this.checkers) {
                try {
                    const status = await checker.getStatus(chainId, id, transaction)
                    if (status !== TransactionStatusType.NOT_DEPEND) {
                        await this.unwatchTransaction(chainId, id)
                        this.options.onNotify(chainId, id, transaction, status)
                        break
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
            this.timer = setTimeout(this.check.bind(this, chainId), this.options.delay)
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

export class TransactionWatcherState<ChainId extends PropertyKey, Transaction>
    implements Web3TransactionWatcherState<ChainId, Transaction>
{
    private watchers: Map<ChainId, Watcher<ChainId, Transaction>> = new Map()

    public storage: StorageItem<TransactionWatcher<ChainId, Transaction>> = null!
    public emitter: Emitter<WatchEvents<ChainId, Transaction>> = new Emitter()

    constructor(
        protected context: Plugin.Shared.SharedUIContext,
        protected chainIds: ChainId[],
        protected checkers: Array<TransactionChecker<ChainId, Transaction>>,
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
        const { storage } = this.context.createKVStorage('memory', {}).createSubScope('TransactionWatcher', {
            value: Object.fromEntries(chainIds.map((x) => [x, {}])) as TransactionWatcher<ChainId, Transaction>,
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
            getSubscriptionCurrentValue(() => this.subscriptions.chainId).then(() => resume())
        }

        // add external transactions at startup
        if (this.subscriptions.transactions) {
            this.subscriptions.transactions.subscribe(() => resume())
            getSubscriptionCurrentValue(() => this.subscriptions.transactions).then(() => resume())
        }
    }

    get ready() {
        return this.storage.initialized
    }

    get readyPromise() {
        return this.storage.initializedPromise
    }

    protected getWatcher(chainId: ChainId) {
        if (!this.watchers.has(chainId))
            this.watchers.set(
                chainId,
                new Watcher(this.storage, this.checkers, {
                    delay: this.options.defaultBlockDelay * 1000,
                    onNotify: this.notifyTransaction.bind(this),
                }),
            )
        return this.watchers.get(chainId)!
    }

    protected resumeWatcher(chainId: ChainId) {
        const watcher = this.getWatcher(chainId)
        watcher.startCheck(chainId)
    }

    async watchTransaction(chainId: ChainId, id: string, transaction: Transaction) {
        await this.getWatcher(chainId).watchTransaction(chainId, id, transaction)
    }

    async unwatchTransaction(chainId: ChainId, id: string) {
        await this.getWatcher(chainId).unwatchTransaction(chainId, id)
    }

    async notifyError(error: RecognizableError, request: JsonRpcPayload) {
        this.emitter.emit('error', error, request)
    }

    async notifyTransaction(chainId: ChainId, id: string, transaction: Transaction, status: TransactionStatusType) {
        throw new Error('Method not implemented.')
    }
}
