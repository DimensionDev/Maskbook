import type { Subscription } from 'use-subscription'
import type { Plugin } from '@masknet/plugin-infra'
import { NetworkPluginID } from '@masknet/shared-base'
import { type ChainId, ChainIdList, type Transaction } from '@masknet/web3-shared-evm'
import { type RecentTransaction, TransactionStatusType } from '@masknet/web3-shared-base'
import { TransactionCheckers } from './TransactionWatcher/checker.js'
import { Web3StateRef } from '../apis/Web3StateAPI.js'
import { TransactionWatcherState } from '../../Base/state/TransactionWatcher.js'

export class TransactionWatcher extends TransactionWatcherState<ChainId, Transaction> {
    constructor(
        context: Plugin.Shared.SharedUIContext,
        subscriptions: {
            chainId?: Subscription<ChainId>
            transactions?: Subscription<Array<RecentTransaction<ChainId, Transaction>>>
        },
    ) {
        super(context, ChainIdList, TransactionCheckers, subscriptions, {
            pluginID: NetworkPluginID.PLUGIN_EVM,
            defaultBlockDelay: 15,
            getTransactionCreator: (tx) => tx.from ?? '',
        })
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
        const { Transaction } = Web3StateRef.value

        // a wallet connected
        if (Transaction) {
            // update record status in transaction state
            if (status !== TransactionStatusType.NOT_DEPEND && transaction.from)
                await Transaction.updateTransaction?.(chainId, transaction.from, id, status)

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
