import type { Subscription } from 'use-subscription'
import { getEnumAsArray } from '@dimensiondev/kit'
import type { Plugin } from '@masknet/plugin-infra'
import { TransactionState, TransactionStorage } from '@masknet/plugin-infra/web3'
import { ChainId, formatAddress } from '@masknet/web3-shared-solana'

export class Transaction extends TransactionState<ChainId, unknown> {
    constructor(
        context: Plugin.Shared.SharedContext,
        subscriptions: {
            account?: Subscription<string>
            chainId?: Subscription<ChainId>
        },
    ) {
        const defaultValue: TransactionStorage<ChainId, unknown> = getEnumAsArray(ChainId).reduce(
            (accumulator, chainId) => {
                accumulator[chainId.value] = {}
                return accumulator
            },
            {} as TransactionStorage<ChainId, unknown>,
        )
        super(context, defaultValue, subscriptions, {
            formatAddress: formatAddress,
        })
    }
}
