import type { Subscription } from 'use-subscription'
import { NetworkPluginID } from '@masknet/shared-base'
import { type ChainId, type Transaction } from '@masknet/web3-shared-evm'
import { type RecentTransaction, TransactionStatusType } from '@masknet/web3-shared-base'
import { EVMTransactionCheckers } from './TransactionWatcher/checker.js'
import { evm } from '../../../Manager/registry.js'
import { TransactionWatcherState } from '../../Base/state/TransactionWatcher.js'

export class EVMTransactionWatcher extends TransactionWatcherState<ChainId, Transaction> {
    constructor(subscriptions: {
        chainId: Subscription<ChainId>
        transactions: Subscription<Array<RecentTransaction<ChainId, Transaction>>>
    }) {
        super(subscriptions, {
            pluginID: NetworkPluginID.PLUGIN_EVM,
            defaultBlockDelay: 15,
            getTransactionCheckers: () => EVMTransactionCheckers,
        })
    }

    override async notifyTransaction(
        chainId: ChainId,
        id: string,
        transaction: Transaction,
        status: TransactionStatusType,
    ) {
        const { Transaction } = evm.state!

        if (Transaction && transaction.from && status !== TransactionStatusType.NOT_DEPEND) {
            await Transaction.updateTransaction?.(chainId, transaction.from, id, status)
        }

        this.emitter.emit('progress', chainId, id, status, transaction)
    }
}
