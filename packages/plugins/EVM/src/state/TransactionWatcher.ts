import type { Subscription } from 'use-subscription'
import { getEnumAsArray } from '@dimensiondev/kit'
import type { Plugin } from '@masknet/plugin-infra'
import { TransactionWatcherState } from '@masknet/plugin-infra/web3'
import { ChainId, Transaction } from '@masknet/web3-shared-evm'
import { RecentTransaction, TransactionStatusType } from '@masknet/web3-shared-base'
import { TransactionCheckers } from './TransactionWatcher/checker'
import { Web3StateSettings } from '../settings'
import { getSubscriptionCurrentValue } from '@masknet/shared-base'

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
                getTransactionCreator: (tx) => (tx.from as string | undefined) ?? '',
            },
        )
    }

    override async watchTransaction(chainId: ChainId, id: string, transaction: Transaction) {
        await super.watchTransaction(chainId, id, transaction)
        this.emitter.emit('progress', id, TransactionStatusType.NOT_DEPEND, transaction)
    }

    override async notifyTransaction(
        chainId: ChainId,
        id: string,
        transaction: Transaction,
        status: TransactionStatusType,
    ) {
        const { Transaction } = Web3StateSettings.value

        // update record status in transaction state
        if (status !== TransactionStatusType.NOT_DEPEND && Transaction?.updateTransaction && transaction.from)
            await Transaction.updateTransaction(chainId, transaction.from as string, id, status)

        // only tracked records will get notified
        getSubscriptionCurrentValue(() => Transaction?.transactions).then((transactions) => {
            if (transactions?.some((x) => Object.keys(x.candidates).includes(id)))
                this.emitter.emit('progress', id, status, transaction)
        })
    }
}
