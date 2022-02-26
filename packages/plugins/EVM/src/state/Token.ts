import type { Subscription } from 'use-subscription'
import { Plugin, TokenState, TokenStorage } from '@masknet/plugin-infra'
import { formatEthereumAddress, isSameAddress, isValidAddress } from '@masknet/web3-shared-evm'

export class Token extends TokenState {
    constructor(
        context: Plugin.Shared.SharedContext,
        subscriptions: {
            account?: Subscription<string>
        },
    ) {
        const defaultValue: TokenStorage = {
            fungibleTokens: [],
            nonFungibleTokens: [],
            fungibleTokenBlockedBy: {},
            nonFungibleTokenBlockedBy: {},
        }
        super(context, defaultValue, subscriptions, {
            isValidAddress,
            isSameAddress,
            formatAddress: formatEthereumAddress,
        })
    }
}
