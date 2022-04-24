import type { Subscription } from 'use-subscription'
import { mapSubscription, mergeSubscription, StorageItem } from '@masknet/shared-base'
import type { Plugin } from '../types'
import type { Web3Plugin } from '../web3-types'

export class TokenListState<
    ChainId extends number,
    SchemaType extends string | number,
    TokenLists extends Record<
        'fungibleTokens' | 'nonFungibleTokens',
        Record<ChainId, Web3Plugin.Token<ChainId, SchemaType>[]>
    > = Record<'fungibleTokens' | 'nonFungibleTokens', Record<ChainId, Web3Plugin.Token<ChainId, SchemaType>[]>>,
> implements Web3Plugin.ObjectCapabilities.TokenListState<ChainId, SchemaType>
{
    protected storage: StorageItem<TokenLists> = null!

    public fungibleTokens?: Subscription<Web3Plugin.FungibleToken<ChainId, SchemaType>[]>
    public nonFungibleTokens?: Subscription<Web3Plugin.NonFungibleToken<ChainId, SchemaType>[]>

    constructor(
        protected context: Plugin.Shared.SharedContext,
        protected defaultValue: TokenLists,
        protected subscriptions: {
            chainId?: Subscription<ChainId>
        },
    ) {
        const { storage } = context.createKVStorage('memory', {
            value: defaultValue,
        })
        this.storage = storage.value

        if (this.subscriptions.chainId) {
            this.fungibleTokens = mapSubscription(
                mergeSubscription<[ChainId, TokenLists]>(this.subscriptions.chainId, this.storage.subscription),
                ([chainId, tokenLists]) =>
                    tokenLists.fungibleTokens[chainId] as Web3Plugin.FungibleToken<ChainId, SchemaType>[],
            )
            this.nonFungibleTokens = mapSubscription(
                mergeSubscription<[ChainId, TokenLists]>(this.subscriptions.chainId, this.storage.subscription),
                ([chainId, tokenLists]) =>
                    tokenLists.nonFungibleTokens[chainId] as Web3Plugin.NonFungibleToken<ChainId, SchemaType>[],
            )
        }
    }

    protected setTokenList(
        chainId: ChainId,
        tokenList: Web3Plugin.Token<ChainId, SchemaType>[],
        type: 'fungible' | 'nonFungible',
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

    async getFungibleTokenLists(chainId: ChainId) {
        return this.storage.value.fungibleTokens[chainId] as Web3Plugin.FungibleToken<ChainId, SchemaType>[]
    }

    async getNonFungibleTokenLists(chainId: ChainId) {
        return this.storage.value.nonFungibleTokens[chainId] as Web3Plugin.NonFungibleToken<ChainId, SchemaType>[]
    }
}
