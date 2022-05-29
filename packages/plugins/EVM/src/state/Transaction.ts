import type { Subscription } from 'use-subscription'
import { getEnumAsArray } from '@dimensiondev/kit'
import type { Plugin } from '@masknet/plugin-infra'
import type { TransactionStorage } from '@masknet/plugin-infra/web3'
import { TransactionState } from '@masknet/plugin-infra/web3'
import { ChainId, Transaction as EVM_Transaction, formatEthereumAddress } from '@masknet/web3-shared-evm'

export class Transaction extends TransactionState<ChainId, EVM_Transaction> {
    constructor(
        context: Plugin.Shared.SharedContext,
        subscriptions: {
            account?: Subscription<string>
            chainId?: Subscription<ChainId>
        },
    ) {
        const defaultValue = Object.fromEntries(
            getEnumAsArray(ChainId).map((x) => [x.value, {}]),
        ) as TransactionStorage<ChainId, EVM_Transaction>

        super(context, defaultValue, subscriptions, {
            formatAddress: formatEthereumAddress,
        })
    }
}
