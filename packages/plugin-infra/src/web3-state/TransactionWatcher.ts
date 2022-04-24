import { Emitter } from '@servie/events'
import type { Plugin } from '../types'
import { TransactionStatusType, Web3Plugin } from '../web3-types'

interface StorageItem<ChainId, Transaction> {
    at: number
    id: string
    chainId: ChainId
    status: TransactionStatusType
    transaction: Transaction
}

class Storage<ChainId, Transaction> {
    static MAX_ITEM_SIZE = 40

    private map = new Map<ChainId, Map<string, StorageItem<ChainId, Transaction>>>()

    private getStorage(chainId: ChainId) {
        if (!this.map.has(chainId)) this.map.set(chainId, new Map())
        return this.map.get(chainId)!
    }

    public hasItem(chainId: ChainId, id: string) {
        return this.getStorage(chainId).has(id)
    }

    public getItem(chainId: ChainId, id: string) {
        return this.getStorage(chainId).get(id)
    }

    public setItem(chainId: ChainId, id: string, transaction: StorageItem<ChainId, Transaction>) {
        this.getStorage(chainId).set(id, transaction)
    }

    public removeItem(chainId: ChainId, id: string) {
        this.getStorage(chainId).delete(id)
    }

    public getItems(chainId: ChainId) {
        const map = this.getStorage(chainId)
        return map ? [...map.entries()].sort(([, a], [, z]) => z.at - a.at) : []
    }

    public getWatched(chainId: ChainId) {
        return this.getItems(chainId).slice(0, Storage.MAX_ITEM_SIZE)
    }

    public getUnwatched(chainId: ChainId) {
        return this.getItems(chainId).slice(Storage.MAX_ITEM_SIZE)
    }
}

class Watcher<ChainId, Trnasaction> {
    static LATEST_TRANSACTION_SIZE = 5

    private timer: NodeJS.Timeout | null = null
    private storage = new Storage<ChainId, Trnasaction>()

    constructor(
        protected checkers: Web3Plugin.TransactionChecker<ChainId>[],
        protected options: {
            delay: number
            onNotify: (id: string, status: TransactionStatusType) => void
        },
    ) {}

    private async check(chainId: ChainId) {
        // stop any pending task
        this.stopCheck()

        // unwatch legacy transactions
        this.storage.getUnwatched(chainId).forEach(([id]) => this.unwatchTransaction(chainId, id))

        // check if all transactions were sealed
        const watchedTransactions = this.storage
            .getWatched(chainId)
            .filter(([, x]) => x.status !== TransactionStatusType.NOT_DEPEND)
        if (!watchedTransactions.length) return

        for (const [id] of watchedTransactions) {
            for (const checker of this.checkers) {
                const status = await checker.checkStatus(chainId, id)
                if (status !== TransactionStatusType.NOT_DEPEND) this.options.onNotify(id, status)
            }
        }

        // kick to the next round
        this.startCheck(chainId)
    }

    private startCheck(chainId: ChainId) {
        this.stopCheck()
        if (this.timer === null) {
            this.timer = setTimeout(this.check.bind(this, chainId), this.options.delay)
        }
    }

    private stopCheck() {
        if (this.timer !== null) clearTimeout(this.timer)
        this.timer = null
    }

    public watchTransaction(chainId: ChainId, id: string, transaction: Trnasaction) {
        if (!this.storage.hasItem(chainId, id)) {
            this.storage.setItem(chainId, id, {
                at: Date.now(),
                id,
                chainId,
                status: TransactionStatusType.NOT_DEPEND,
                transaction,
            })
        }
        this.startCheck(chainId)
    }

    public unwatchTransaction(chainId: ChainId, id: string) {
        this.storage.removeItem(chainId, id)
    }
}

export class TransactionWatcherState<ChainId, Transaction>
    implements Web3Plugin.ObjectCapabilities.TransactionWatcherState<ChainId, Transaction>
{
    private watchers: Map<ChainId, Watcher<ChainId, Transaction>> = new Map()

    emitter: Emitter<Web3Plugin.WatchEvents> = new Emitter()

    constructor(
        protected context: Plugin.Shared.SharedContext,
        protected checkers: Web3Plugin.TransactionChecker<ChainId>[],
        protected options: {
            getAverageBlockDelay: (chainId: ChainId, scale?: number) => number
        },
    ) {}

    private getWatcher(chainId: ChainId) {
        if (!this.watchers.has(chainId))
            this.watchers.set(
                chainId,
                new Watcher(this.checkers, {
                    delay: this.options.getAverageBlockDelay(chainId),
                    onNotify: this.notifyTransaction.bind(this),
                }),
            )
        return this.watchers.get(chainId)!
    }

    watchTrasnsaction(chainId: ChainId, id: string, transaction: Transaction) {
        this.getWatcher(chainId).watchTransaction(chainId, id, transaction)
    }

    unwatchTransaction(chainId: ChainId, id: string) {
        this.getWatcher(chainId).unwatchTransaction(chainId, id)
    }

    notifyTransaction(id: string, status: TransactionStatusType) {
        this.emitter.emit('progress', id, status)
    }
}
