import type { Subscription } from 'use-subscription'
import type { Plugin } from '@masknet/plugin-infra'
import { TokenState, TokenStorage } from '@masknet/plugin-infra/web3'
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
