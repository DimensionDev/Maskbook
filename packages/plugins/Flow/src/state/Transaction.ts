import type { Subscription } from 'use-subscription'
import { getEnumAsArray } from '@dimensiondev/kit'
import type { Plugin } from '@masknet/plugin-infra'
import { TransactionStorage, TransactionState } from '@masknet/plugin-infra/web3'
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
        // TODO: 6002
        // eslint-disable-next-line unicorn/no-array-reduce
        const defaultValue: TransactionStorage<ChainId, MutateOptions> = getEnumAsArray(ChainId).reduce<
            TransactionStorage<ChainId, MutateOptions>
        >((accumulator, chainId) => {
            accumulator[chainId.value] = {}
            return accumulator
        }, {})
        super(context, defaultValue, subscriptions, {
            formatAddress,
        })
    }
}
