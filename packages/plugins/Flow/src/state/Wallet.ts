import type { Subscription } from 'use-subscription'
import type { Plugin } from '@masknet/plugin-infra'
import { WalletState } from '@masknet/web3-state'
import { formatAddress, getDefaultChainId, ChainId, ProviderType, Transaction } from '@masknet/web3-shared-flow'

export class Wallet extends WalletState<ChainId, ProviderType, Transaction> {
    constructor(
        context: Plugin.Shared.SharedUIContext,
        subscriptions: {
            account?: Subscription<string>
            chainId?: Subscription<ChainId>
            providerType?: Subscription<ProviderType>
        },
    ) {
        super(context, [], subscriptions, {
            getDefaultChainId,
            formatAddress,
        })
    }
}
