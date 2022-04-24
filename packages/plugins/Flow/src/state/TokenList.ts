import type { Subscription } from 'use-subscription'
import { getEnumAsArray } from '@dimensiondev/kit'
import type { Plugin } from '@masknet/plugin-infra'
import { TokenListState, Web3Plugin } from '@masknet/plugin-infra/web3'
import { ChainId, getTokenConstants, SchemaType } from '@masknet/web3-shared-flow'
import { createFungibleToken } from '../helpers'

export class TokenList
    extends TokenListState<ChainId, SchemaType>
    implements Web3Plugin.ObjectCapabilities.TokenListState<ChainId, SchemaType>
{
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

    private composeFungibleTokenList(chainId: ChainId): Web3Plugin.FungibleToken<ChainId, SchemaType>[] {
        const { FLOW_ADDRESS = '', FUSD_ADDRESS = '', TETHER_ADDRESS = '' } = getTokenConstants(chainId)
        return [
            createFungibleToken(
                chainId,
                FLOW_ADDRESS,
                'Flow',
                'FLOW',
                8,
                new URL('../assets/flow.png', import.meta.url).toString(),
            ),
            createFungibleToken(
                chainId,
                FUSD_ADDRESS,
                'Flow USD',
                'FUSD',
                8,
                new URL('../assets/FUSD.png', import.meta.url).toString(),
            ),
            createFungibleToken(
                chainId,
                TETHER_ADDRESS,
                'Tether USD',
                'tUSD',
                8,
                new URL('../assets/tUSD.png', import.meta.url).toString(),
            ),
        ]
    }

    async getFungibleTokens(chainId: ChainId) {
        const tokenListCached = await super.getFungibleTokenLists(chainId)
        if (tokenListCached) return tokenListCached

        super.setTokenList(
            chainId,
            this.composeFungibleTokenList(chainId) as Web3Plugin.Token<ChainId, SchemaType>[],
            'fungible',
        )
        return super.getFungibleTokenLists(chainId)
    }
}
