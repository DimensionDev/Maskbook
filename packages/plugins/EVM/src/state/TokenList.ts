import type { Subscription } from 'use-subscription'
import { getEnumAsArray } from '@dimensiondev/kit'
import type { Plugin } from '@masknet/plugin-infra'
import { TokenListState, Web3Plugin } from '@masknet/plugin-infra/web3'
import { TokenList as TokenListAPI } from '@masknet/web3-providers'
import { ChainId, getTokenListConstants, SchemaType } from '@masknet/web3-shared-evm'

export class TokenList extends TokenListState<ChainId, SchemaType> {
    constructor(
        context: Plugin.Shared.SharedContext,
        subscriptions: {
            chainId?: Subscription<ChainId>
        },
    ) {
        const defaultValue = getEnumAsArray(ChainId).reduce((accumualtor, chainId) => {
            accumualtor.fungibleTokens = {
                ...accumualtor.fungibleTokens,
                [chainId.value]: [],
            }
            accumualtor.nonFungibleTokens = {
                ...accumualtor.nonFungibleTokens,
                [chainId.value]: [],
            }
            return accumualtor
        }, {} as Record<'fungibleTokens' | 'nonFungibleTokens', Record<ChainId, Web3Plugin.Token<ChainId, SchemaType>[]>>)

        super(context, defaultValue, subscriptions)
    }

    async getFungibleTokens(chainId: ChainId) {
        const tokenListCached = await super.getFungibleTokenLists(chainId)
        if (tokenListCached) return tokenListCached

        const { FUNGIBLE_TOKEN_LISTS = [] } = getTokenListConstants(chainId)
        super.setTokenList(
            chainId,
            await TokenListAPI.fetchFungibleTokensFromTokenLists(chainId, FUNGIBLE_TOKEN_LISTS),
            'fungible',
        )
        return super.getFungibleTokenLists(chainId)
    }
}
