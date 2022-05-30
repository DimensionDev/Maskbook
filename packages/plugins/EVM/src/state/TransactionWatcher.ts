import type { Plugin } from '@masknet/plugin-infra'
import { TransactionWatcherState } from '@masknet/plugin-infra/web3'
import type { ChainId, Transaction } from '@masknet/web3-shared-evm'
import { TransactionCheckers } from './TransactionWatcher/checker'

export class TransactionWatcher extends TransactionWatcherState<ChainId, Transaction> {
    constructor(context: Plugin.Shared.SharedContext) {
        super(context, TransactionCheckers, {
            defaultBlockDelay: 15,
        })
    }
}
