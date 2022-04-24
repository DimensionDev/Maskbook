import type { Subscription } from 'use-subscription'
import type { Plugin } from '@masknet/plugin-infra'
import { TokenState, TokenStorage, Web3Plugin } from '@masknet/plugin-infra/web3'
import { ChainId, formatEthereumAddress, isSameAddress, isValidAddress, SchemaType } from '@masknet/web3-shared-evm'

export class Token
    extends TokenState<ChainId, SchemaType>
    implements Web3Plugin.ObjectCapabilities.TokenState<ChainId, SchemaType>
{
    constructor(
        context: Plugin.Shared.SharedContext,
        subscriptions: {
            account?: Subscription<string>
        },
    ) {
        const defaultValue: TokenStorage<ChainId, SchemaType> = {
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
