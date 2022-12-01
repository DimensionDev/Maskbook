import type { Subscription } from 'use-subscription'
import { getEnumAsArray } from '@masknet/kit'
import type { Plugin } from '@masknet/plugin-infra'
import { WalletState } from '@masknet/web3-state'
import { formatEthereumAddress, ProviderType, Transaction } from '@masknet/web3-shared-evm'

export class Wallet extends WalletState<ProviderType, Transaction> {
    constructor(
        context: Plugin.Shared.SharedUIContext,
        subscriptions: {
            providerType?: Subscription<ProviderType>
        },
    ) {
        super(
            context,
            getEnumAsArray(ProviderType).map((x) => x.value),
            subscriptions,
            {
                formatAddress: formatEthereumAddress,
            },
        )
    }
}
