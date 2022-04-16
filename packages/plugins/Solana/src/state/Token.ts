import type { Subscription } from 'use-subscription'
import type { Plugin } from '@masknet/plugin-infra'
import { TokenState, TokenStorage } from '@masknet/plugin-infra/web3'
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
