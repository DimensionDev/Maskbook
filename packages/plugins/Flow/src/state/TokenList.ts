import type { Subscription } from 'use-subscription'
import { getEnumAsArray } from '@dimensiondev/kit'
import type { Plugin } from '@masknet/plugin-infra'
import { TokenListState } from '@masknet/plugin-infra/web3'
import type { FungibleToken, Token } from '@masknet/web3-shared-base'
import { ChainId, getTokenConstants, SchemaType } from '@masknet/web3-shared-flow'
import { createFungibleToken } from '../helpers'

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
        }, {} as Record<'fungibleTokens' | 'nonFungibleTokens', Record<ChainId, Token<ChainId, SchemaType>[]>>)

        super(context, defaultValue, subscriptions)
    }

    private composeFungibleTokenList(chainId: ChainId): FungibleToken<ChainId, SchemaType>[] {
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

    async getTokensList(type: 'fungible' | 'nonFungible', chainId: ChainId) {
        if (type === 'nonFungible') throw new Error('Not implmented yet.')

        const tokenListCached = await super.getTokenList('fungible', chainId)
        if (tokenListCached) return tokenListCached

        super.setTokenList('fungible', chainId, this.composeFungibleTokenList(chainId))
        return super.getTokenList('fungible', chainId)
    }
}
