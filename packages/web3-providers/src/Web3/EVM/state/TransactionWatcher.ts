import type { Subscription } from 'use-subscription'
import type { Plugin } from '@masknet/plugin-infra'
import { NetworkPluginID } from '@masknet/shared-base'
import { type ChainId, type Transaction } from '@masknet/web3-shared-evm'
import { type RecentTransaction, TransactionStatusType } from '@masknet/web3-shared-base'
import { TransactionCheckers } from './TransactionWatcher/checker.js'
import { Web3StateRef } from '../apis/Web3StateAPI.js'
import { TransactionWatcherState } from '../../Base/state/TransactionWatcher.js'

export class TransactionWatcher extends TransactionWatcherState<ChainId, Transaction> {
    constructor(
        context: Plugin.Shared.SharedUIContext,
        subscriptions: {
            chainId: Subscription<ChainId>
            transactions: Subscription<Array<RecentTransaction<ChainId, Transaction>>>
        },
    ) {
        super(context, subscriptions, {
            pluginID: NetworkPluginID.PLUGIN_EVM,
            defaultBlockDelay: 15,
            getTransactionCheckers: () => TransactionCheckers,
        })
    }

    override async notifyTransaction(
        chainId: ChainId,
        id: string,
        transaction: Transaction,
        status: TransactionStatusType,
    ) {
        const { Transaction } = Web3StateRef.value

        if (Transaction && transaction.from && status !== TransactionStatusType.NOT_DEPEND) {
            await Transaction.updateTransaction?.(chainId, transaction.from, id, status)
        }

        this.emitter.emit('progress', chainId, id, status, transaction)
    }
}
