import type { Subscription } from 'use-subscription'
import { getEnumAsArray } from '@dimensiondev/kit'
import { Plugin, TransactionState, TransactionStorage } from '@masknet/plugin-infra'
import { ChainId, EthereumTransactionConfig, formatEthereumAddress } from '@masknet/web3-shared-evm'

export class Transaction extends TransactionState<ChainId, EthereumTransactionConfig> {
    constructor(
        context: Plugin.Shared.SharedContext,
        subscriptions: {
            account?: Subscription<string>
            chainId?: Subscription<ChainId>
        },
    ) {
        const defaultValue: TransactionStorage<ChainId, EthereumTransactionConfig> = getEnumAsArray(ChainId).reduce(
            (accumulator, chainId) => {
                accumulator[chainId.value] = {}
                return accumulator
            },
            {} as TransactionStorage<ChainId, EthereumTransactionConfig>,
        )
        super(context, defaultValue, subscriptions, {
            formatAddress: formatEthereumAddress,
        })
    }
}
