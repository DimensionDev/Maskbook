import type { Subscription } from 'use-subscription'
import { mapSubscription, mergeSubscription, StorageItem } from '@masknet/shared-base'
import type {
    FungibleToken,
    NonFungibleToken,
    Token,
    TokenListState as Web3TokenListState,
} from '@masknet/web3-shared-base'
import type { Plugin } from '../types'

export class TokenListState<
    ChainId extends number,
    SchemaType extends string | number,
    TokenLists extends Record<
        'fungibleTokens' | 'nonFungibleTokens',
        Record<ChainId, Token<ChainId, SchemaType>[]>
    > = Record<'fungibleTokens' | 'nonFungibleTokens', Record<ChainId, Token<ChainId, SchemaType>[]>>,
> implements Web3TokenListState<ChainId, SchemaType>
{
    protected storage: StorageItem<TokenLists> = null!

    public fungibleTokens?: Subscription<FungibleToken<ChainId, SchemaType>[]>
    public nonFungibleTokens?: Subscription<NonFungibleToken<ChainId, SchemaType>[]>

    constructor(
        protected context: Plugin.Shared.SharedContext,
        protected defaultValue: TokenLists,
        protected subscriptions: {
            chainId?: Subscription<ChainId>
        },
    ) {
        const { storage } = context.createKVStorage('memory', 'TokenList', {
            value: defaultValue,
        })
        this.storage = storage.value

        if (this.subscriptions.chainId) {
            this.fungibleTokens = mapSubscription(
                mergeSubscription<[ChainId, TokenLists]>(this.subscriptions.chainId, this.storage.subscription),
                ([chainId, tokenLists]) => {
                    console.log({
                        chainId,
                        tokenLists,
                    })
                    return tokenLists.fungibleTokens[chainId] as FungibleToken<ChainId, SchemaType>[]
                },
            )
            this.nonFungibleTokens = mapSubscription(
                mergeSubscription<[ChainId, TokenLists]>(this.subscriptions.chainId, this.storage.subscription),
                ([chainId, tokenLists]) => {
                    console.log({
                        chainId,
                        tokenLists,
                    })
                    return tokenLists.nonFungibleTokens[chainId] as NonFungibleToken<ChainId, SchemaType>[]
                },
            )
        }
    }

    async getTokens(type: 'fungible' | 'nonFungible', chainId: ChainId) {
        if (type === 'fungible')
            return this.storage.value.fungibleTokens[chainId] as FungibleToken<ChainId, SchemaType>[]
        return this.storage.value.nonFungibleTokens[chainId] as NonFungibleToken<ChainId, SchemaType>[]
    }

    getFungibleTokens(chainId: ChainId) {
        return this.getTokens('fungible', chainId) as Promise<FungibleToken<ChainId, SchemaType>[]>
    }

    getNonFungibleTokens(chainId: ChainId) {
        return this.getTokens('nonFungible', chainId) as Promise<NonFungibleToken<ChainId, SchemaType>[]>
    }

    protected setTokenList(
        type: 'fungible' | 'nonFungible',
        chainId: ChainId,
        tokenList: Token<ChainId, SchemaType>[],
    ) {
        const all = this.storage.value
        this.storage.setValue({
            ...all,
            fungibleTokens:
                type === 'fungible'
                    ? {
                          ...all.fungibleTokens,
                          [chainId]: tokenList,
                      }
                    : all.fungibleTokens,
            nonFungibleTokens:
                type === 'nonFungible'
                    ? {
                          ...all.nonFungibleTokens,
                          [chainId]: tokenList,
                      }
                    : all.nonFungibleTokens,
        })
    }
}
