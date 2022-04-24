import type { Plugin } from '@masknet/plugin-infra'
import { TransactionWatcherState, Web3Plugin } from '@masknet/plugin-infra/web3'
import { ChainId, Transaction, getAverageBlockDelay } from '@masknet/web3-shared-evm'
import { TransactionCheckers } from './TransactionWatcher/checker'

export class TransactionWatcher
    extends TransactionWatcherState<ChainId, Transaction>
    implements Web3Plugin.ObjectCapabilities.TransactionWatcherState<ChainId, Transaction>
{
    constructor(context: Plugin.Shared.SharedContext) {
        super(context, TransactionCheckers, {
            getAverageBlockDelay,
        })
    }
}
