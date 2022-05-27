import type { Subscription } from 'use-subscription'
import { getEnumAsArray } from '@dimensiondev/kit'
import type { Plugin } from '@masknet/plugin-infra'
import { TransactionStorage, TransactionState } from '@masknet/plugin-infra/web3'
import { ChainId, Transaction as SolanaTransaction, formatAddress } from '@masknet/web3-shared-solana'

export class Transaction extends TransactionState<ChainId, SolanaTransaction> {
    constructor(
        context: Plugin.Shared.SharedContext,
        subscriptions: {
            account?: Subscription<string>
            chainId?: Subscription<ChainId>
        },
    ) {
        const defaultValue = Object.fromEntries(
            getEnumAsArray(ChainId).map((x) => [x.value, {}]),
        ) as TransactionStorage<ChainId, SolanaTransaction>

        super(context, defaultValue, subscriptions, {
            formatAddress,
        })
    }
}
