import type { Subscription } from 'use-subscription'
import { Plugin, TokenState, TokenStorage } from '@masknet/plugin-infra'
import { formatAddress, isSameAddress, isValidAddress } from '@masknet/web3-shared-solana'

export class Token extends TokenState {
    constructor(
        protected override context: Plugin.Shared.SharedContext,
        protected override subscriptions: {
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
            formatAddress,
        })
    }
}
