import type { Subscription } from 'use-subscription'
import type { Plugin, Web3Plugin } from '@masknet/plugin-infra'
import { mapSubscription, mergeSubscription, StorageItem } from '@masknet/shared-base'

export class TokenListState<
    ChainId extends number,
    TokenLists extends Record<'fungibleTokens' | 'nonFungibleTokens', Record<ChainId, Web3Plugin.Token[]>> = Record<
        'fungibleTokens' | 'nonFungibleTokens',
        Record<ChainId, Web3Plugin.Token[]>
    >,
> implements Web3Plugin.ObjectCapabilities.TokenListState<ChainId>
{
    protected storage: StorageItem<TokenLists> = null!

    public fungibleTokens?: Subscription<Web3Plugin.FungibleToken[]>
    public nonFungibleTokens?: Subscription<Web3Plugin.NonFungibleToken[]>

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
                ([chainId, tokenLists]) => tokenLists.fungibleTokens[chainId] as Web3Plugin.FungibleToken[],
            )
            this.nonFungibleTokens = mapSubscription(
                mergeSubscription<[ChainId, TokenLists]>(this.subscriptions.chainId, this.storage.subscription),
                ([chainId, tokenLists]) => tokenLists.nonFungibleTokens[chainId] as Web3Plugin.NonFungibleToken[],
            )
        }
    }

    protected setTokenList(chainId: ChainId, tokenList: Web3Plugin.Token[], type: 'fungible' | 'nonFungible') {
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
        return this.storage.value.fungibleTokens[chainId] as Web3Plugin.FungibleToken[]
    }

    async getNonFungibleTokenLists(chainId: ChainId) {
        return this.storage.value.nonFungibleTokens[chainId] as Web3Plugin.NonFungibleToken[]
    }
}
