import type { Subscription } from 'use-subscription'
import { Emitter } from '@servie/events'
import type { JsonRpcPayload } from 'web3-core-helpers'
import { mergeSubscription, type NetworkPluginID } from '@masknet/shared-base'
import {
    type TransactionChecker,
    TransactionStatusType,
    type WatchEvents,
    type TransactionWatcherState as Web3TransactionWatcherState,
    type RecentTransaction,
    type RecognizableError,
} from '@masknet/web3-shared-base'

class Checker<ChainId extends PropertyKey, Transaction> {
    private timer: ReturnType<typeof setTimeout> | null = null

    constructor(
        protected checkers: Array<TransactionChecker<ChainId, Transaction>>,
        protected subscriptions: {
            chainId: Subscription<ChainId>
            transactions: Subscription<Array<RecentTransaction<ChainId, Transaction>>>
        },
        protected options: {
            delay: number
            onNotify: (
                chainId: ChainId,
                id: string,
                transaction: Transaction,
                status: TransactionStatusType,
            ) => Promise<void>
        },
    ) {}

    private async check() {
        const chainId = this.subscriptions.chainId.getCurrentValue()
        const transactions = this.subscriptions.transactions
            .getCurrentValue()
            .filter((x) => x.status === TransactionStatusType.NOT_DEPEND)
            .flatMap((x) => Object.entries(x.candidates))
        if (!transactions.length) return

        for (const [id, transaction] of transactions) {
            for (const checker of this.checkers) {
                try {
                    const status = await checker.getStatus(chainId, id, transaction)
                    if (status !== TransactionStatusType.NOT_DEPEND) {
                        await this.options.onNotify(chainId, id, transaction, status)
                        break
                    }
                } catch (error) {
                    console.warn('Failed to check transaction status.')
                }
            }
        }

        // kick to the next round
        this.startCheck()
    }

    public startCheck() {
        this.stopCheck()
        this.timer = setTimeout(this.check.bind(this), this.options.delay)
    }

    public stopCheck() {
        if (this.timer !== null) clearTimeout(this.timer)
        this.timer = null
    }
}

export abstract class TransactionWatcherState<ChainId extends PropertyKey, Transaction>
    implements Web3TransactionWatcherState<ChainId, Transaction>
{
    public emitter: Emitter<WatchEvents<ChainId, Transaction>> = new Emitter()

    constructor(
        protected subscriptions: {
            chainId: Subscription<ChainId>
            transactions: Subscription<Array<RecentTransaction<ChainId, Transaction>>>
        },
        protected options: {
            pluginID: NetworkPluginID
            /** Default block delay in seconds */
            defaultBlockDelay: number
            /** Get all supported checkers */
            getTransactionCheckers: () => Array<TransactionChecker<ChainId, Transaction>>
        },
    ) {
        const checker = new Checker(this.options.getTransactionCheckers(), this.subscriptions, {
            delay: this.options.defaultBlockDelay * 1000,
            onNotify: this.notifyTransaction.bind(this),
        })

        mergeSubscription(subscriptions.chainId, subscriptions.transactions).subscribe(() => {
            checker.startCheck()
        })
    }

    async notifyError(error: RecognizableError, request: JsonRpcPayload) {
        this.emitter.emit('error', error, request)
    }

    abstract notifyTransaction(
        chainId: ChainId,
        id: string,
        transaction: Transaction,
        status: TransactionStatusType,
    ): Promise<void>
}
