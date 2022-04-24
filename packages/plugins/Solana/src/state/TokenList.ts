import type { Subscription } from 'use-subscription'
import { getEnumAsArray } from '@dimensiondev/kit'
import type { Plugin } from '@masknet/plugin-infra'
import { TokenListState, Web3Plugin } from '@masknet/plugin-infra/web3'
import { ChainId, SchemaType } from '@masknet/web3-shared-solana'

export class TokenList extends TokenListState<ChainId, SchemaType> {
    constructor(
        protected override context: Plugin.Shared.SharedContext,
        protected override subscriptions: {
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
        return []
    }
}
