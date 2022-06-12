import { getEnumAsArray } from '@dimensiondev/kit'
import type { Plugin } from '@masknet/plugin-infra'
import { TransactionWatcherState } from '@masknet/plugin-infra/web3'
import { ChainId, Transaction } from '@masknet/web3-shared-evm'
import type { Subscription } from 'use-subscription'
import { TransactionCheckers } from './TransactionWatcher/checker'

export class TransactionWatcher extends TransactionWatcherState<ChainId, Transaction> {
    constructor(
        context: Plugin.Shared.SharedContext,
        subscriptions: {
            chainId?: Subscription<ChainId>
        },
    ) {
        super(
            context,
            getEnumAsArray(ChainId).map((x) => x.value),
            TransactionCheckers,
            subscriptions,
            {
                defaultBlockDelay: 15,
            },
        )
    }
}
