import type { Subscription } from 'use-subscription'
import { getEnumAsArray } from '@masknet/kit'
import type { Plugin } from '@masknet/plugin-infra'
import { TransactionWatcherState } from '@masknet/web3-state'
import { ChainId, type Transaction } from '@masknet/web3-shared-evm'
import { type RecentTransaction, TransactionStatusType } from '@masknet/web3-shared-base'
import { TransactionCheckers } from './TransactionWatcher/checker.js'
import { Web3StateSettings } from '../settings/index.js'

export class TransactionWatcher extends TransactionWatcherState<ChainId, Transaction> {
    constructor(
        context: Plugin.Shared.SharedContext,
        subscriptions: {
            chainId?: Subscription<ChainId>
            transactions?: Subscription<Array<RecentTransaction<ChainId, Transaction>>>
        },
    ) {
        super(
            context,
            getEnumAsArray(ChainId).map((x) => x.value),
            TransactionCheckers,
            subscriptions,
            {
                defaultBlockDelay: 15,
                getTransactionCreator: (tx) => tx.from ?? '',
            },
        )
    }

    override async watchTransaction(chainId: ChainId, id: string, transaction: Transaction) {
        await super.watchTransaction(chainId, id, transaction)
        this.emitter.emit('progress', chainId, id, TransactionStatusType.NOT_DEPEND, transaction)
    }

    override async notifyTransaction(
        chainId: ChainId,
        id: string,
        transaction: Transaction,
        status: TransactionStatusType,
    ) {
        const { Transaction } = Web3StateSettings.value

        // a wallet connected
        if (Transaction) {
            // update record status in transaction state
            if (status !== TransactionStatusType.NOT_DEPEND && transaction.from)
                await Transaction.updateTransaction?.(chainId, transaction.from as string, id, status)

            // only tracked records will get notified
            if (transaction.from) {
                const stored = await Transaction.getTransaction?.(chainId, transaction.from, id)
                if (stored) this.emitter.emit('progress', chainId, id, status, transaction)
            }
        } else {
            this.emitter.emit('progress', chainId, id, status, transaction)
        }
    }
}
