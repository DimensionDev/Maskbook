import type { Subscription } from 'use-subscription'
import { getEnumAsArray } from '@dimensiondev/kit'
import { Plugin, TokenListState, Web3Plugin } from '@masknet/plugin-infra'
import { ChainId, getTokenConstants } from '@masknet/web3-shared-flow'
import { createFungibleToken } from '../helpers'

export class TokenList extends TokenListState<ChainId> {
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
        }, {} as Record<'fungibleTokens' | 'nonFungibleTokens', Record<ChainId, Web3Plugin.Token[]>>)

        super(context, defaultValue, subscriptions)
    }

    private composeFungibleTokenList(chainId: ChainId): Web3Plugin.FungibleToken[] {
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

    override async getFungibleTokenLists(chainId: ChainId) {
        const tokenListCached = await super.getFungibleTokenLists(chainId)
        if (tokenListCached) return tokenListCached

        super.setTokenList(chainId, this.composeFungibleTokenList(chainId) as Web3Plugin.Token[], 'fungible')
        return super.getFungibleTokenLists(chainId)
    }
}
