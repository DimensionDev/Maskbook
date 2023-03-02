import type { Subscription } from 'use-subscription'
import type { Plugin } from '@masknet/plugin-infra'
import { WalletState } from '@masknet/web3-state'
import { formatAddress, type ProviderType, type Transaction } from '@masknet/web3-shared-flow'

export class Wallet extends WalletState<ProviderType, Transaction> {
    constructor(
        context: Plugin.Shared.SharedUIContext,
        subscriptions: {
            providerType?: Subscription<ProviderType>
        },
    ) {
        super(context, [], subscriptions, {
            formatAddress,
        })
    }
}
