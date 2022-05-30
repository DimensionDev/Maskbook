import type { Subscription } from 'use-subscription'
import { getEnumAsArray } from '@dimensiondev/kit'
import type { Plugin } from '@masknet/plugin-infra'
import { TransactionState } from '@masknet/plugin-infra/web3'
import { ChainId } from '@masknet/web3-shared-flow'
import type { MutateOptions } from '@blocto/fcl'
import { formatAddress } from '../helpers'

export class Transaction extends TransactionState<ChainId, MutateOptions> {
    constructor(
        protected override context: Plugin.Shared.SharedContext,
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
            },
        )
    }
}
