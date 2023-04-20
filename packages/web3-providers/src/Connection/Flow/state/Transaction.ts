import type { Subscription } from 'use-subscription'
import type { MutateOptions } from '@blocto/fcl'
import { getEnumAsArray } from '@masknet/kit'
import type { Plugin } from '@masknet/plugin-infra'
import { ChainId, formatAddress, isValidChainId } from '@masknet/web3-shared-flow'
import { TransactionState } from '../../Base/state/Transaction.js'

export class Transaction extends TransactionState<ChainId, MutateOptions> {
    constructor(
        protected override context: Plugin.Shared.SharedUIContext,
        protected override subscriptions: {
            account?: Subscription<string>
            chainId?: Subscription<ChainId>
        },
    ) {
        super(
            context,
            getEnumAsArray(ChainId).map((x) => x.value),
            subscriptions,
            {
                formatAddress,
                isValidChainId,
            },
        )
    }
}
