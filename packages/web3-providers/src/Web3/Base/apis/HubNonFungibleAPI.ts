import { isEmpty } from 'lodash-es'
import {
    attemptUntil,
    type NonFungibleAsset,
    type NonFungibleCollection,
    type NonFungibleTokenRarity,
    type NonFungibleTokenEvent,
    type NonFungibleTokenOrder,
    type OrderSide,
    type NonFungibleTokenContract,
    type NonFungibleTokenSecurity,
    type NonFungibleToken,
    type NonFungibleContractSpender,
    type PriceInToken,
} from '@masknet/web3-shared-base'
import { type Pageable, createPageable, createIndicator, EMPTY_LIST } from '@masknet/shared-base'
import type { AuthorizationAPI, NonFungibleTokenAPI, TokenListAPI } from '@masknet/web3-providers/types'
import { HubProviderAPI_Base } from './HubProviderAPI.js'
import type { HubOptions_Base } from './HubOptionsAPI.js'

export class HubNonFungibleAPI_Base<
    ChainId,
    SchemaType,
    ProviderType,
    NetworkType,
    RequestArguments,
    RequestOptions,
    Transaction,
    TransactionParameter,
> extends HubProviderAPI_Base<
    ChainId,
    SchemaType,
    ProviderType,
    NetworkType,
    RequestArguments,
    RequestOptions,
    Transaction,
    TransactionParameter
> {
    protected getProviders(
        initial?: HubOptions_Base<ChainId>,
    ): Array<
        AuthorizationAPI.Provider<ChainId> &
            NonFungibleTokenAPI.Provider<ChainId, SchemaType> &
            TokenListAPI.Provider<ChainId, SchemaType>
    > {
        throw new Error('Method not implemented.')
    }

    async getNonFungibleTokenBalance(address: string, initial?: HubOptions_Base<ChainId>): Promise<number> {
        throw new Error('Method not implemented.')
    }

    async getNonFungibleRarity(
        address: string,
        tokenId: string,
        initial?: HubOptions_Base<ChainId>,
    ): Promise<NonFungibleTokenRarity<ChainId> | undefined> {
        const options = this.HubOptions.fill(initial)
        const providers = this.getProviders(initial)
        return attemptUntil(
            providers.map((x) => () => x.getRarity?.(address, tokenId, options)),
            undefined,
        )
    }

    async getNonFungibleAsset(
        address: string,
        tokenId: string,
        initial?: HubOptions_Base<ChainId>,
    ): Promise<NonFungibleAsset<ChainId, SchemaType> | undefined> {
        const options = this.HubOptions.fill(initial)
        const providers = this.getProviders(initial)
        return attemptUntil(
            providers.map((x) => () => x.getAsset?.(address, tokenId, options)),
            undefined,
            (v) => !v,
        )
    }

    async getNonFungibleAssets(
        account: string,
        initial?: HubOptions_Base<ChainId>,
    ): Promise<Pageable<NonFungibleAsset<ChainId, SchemaType>>> {
        const options = this.HubOptions.fill({
            ...initial,
            account,
        })
        const providers = this.getProviders(initial)
        return attemptUntil(
            providers.map((x) => () => x.getAssets?.(options.account, options)),
            createPageable(EMPTY_LIST, createIndicator(options.indicator)),
        )
    }

    async getNonFungibleTokenFloorPrice(
        address: string,
        tokenId: string,
        initial?: HubOptions_Base<ChainId>,
    ): Promise<PriceInToken<ChainId, SchemaType> | undefined> {
        const options = this.HubOptions.fill(initial)
        const providers = this.getProviders(initial)
        return attemptUntil(
            providers.map((x) => () => x.getFloorPrice?.(address, tokenId, options)),
            undefined,
        )
    }

    async getNonFungibleAssetsByCollection(
        address: string,
        initial?: HubOptions_Base<ChainId>,
    ): Promise<Pageable<NonFungibleAsset<ChainId, SchemaType>> | undefined> {
        const options = this.HubOptions.fill(initial)
        const providers = this.getProviders(initial)
        return attemptUntil(
            providers.map((x) => () => x.getAssetsByCollection?.(address, options)),
            createPageable(EMPTY_LIST, createIndicator(options.indicator)),
        )
    }

    async getNonFungibleAssetsByCollectionAndOwner(
        collectionId: string,
        owner: string,
        initial?: HubOptions_Base<ChainId>,
    ): Promise<Pageable<NonFungibleAsset<ChainId, SchemaType>>> {
        const options = this.HubOptions.fill(initial)
        const providers = this.getProviders(initial)
        return attemptUntil(
            providers.map((x) => () => x.getAssetsByCollectionAndOwner?.(collectionId, owner, options)),
            createPageable(EMPTY_LIST, createIndicator(options.indicator)),
        )
    }

    async getNonFungibleTokenContract(
        address: string,
        initial?: HubOptions_Base<ChainId>,
    ): Promise<NonFungibleTokenContract<ChainId, SchemaType> | undefined> {
        const options = this.HubOptions.fill(initial)
        const providers = this.getProviders(initial)
        return attemptUntil(
            providers.map((x) => () => x.getContract?.(address, options)),
            undefined,
        )
    }

    async getNonFungibleTokenPrice(
        chainId: ChainId,
        address: string,
        tokenId: string,
        initial?: HubOptions_Base<ChainId>,
    ): Promise<never> {
        throw new Error('Method not implemented.')
    }

    async getNonFungibleTokenEvents(
        address: string,
        tokenId: string,
        initial?: HubOptions_Base<ChainId>,
    ): Promise<Pageable<NonFungibleTokenEvent<ChainId, SchemaType>>> {
        const options = this.HubOptions.fill(initial)
        const providers = this.getProviders(initial)
        return attemptUntil(
            providers.map((x) => () => x.getEvents?.(address, tokenId, options)),
            createPageable(EMPTY_LIST, createIndicator(options.indicator)),
        )
    }

    async getNonFungibleTokenListings(
        address: string,
        tokenId: string,
        initial?: HubOptions_Base<ChainId>,
    ): Promise<Pageable<NonFungibleTokenOrder<ChainId, SchemaType>>> {
        const options = this.HubOptions.fill(initial)
        const providers = this.getProviders(initial)
        return attemptUntil(
            providers.map((x) => () => x.getListings?.(address, tokenId, options)),
            createPageable(EMPTY_LIST, createIndicator(options.indicator)),
        )
    }

    async getNonFungibleTokenOffers(
        address: string,
        tokenId: string,
        initial?: HubOptions_Base<ChainId>,
    ): Promise<Pageable<NonFungibleTokenOrder<ChainId, SchemaType>>> {
        const options = this.HubOptions.fill(initial)
        const providers = this.getProviders(initial)
        return attemptUntil(
            providers.map((x) => () => x.getOffers?.(address, tokenId, options)),
            createPageable(EMPTY_LIST, createIndicator(options.indicator)),
            (result) => !result?.data.length,
        )
    }

    async getNonFungibleTokenOrders(
        address: string,
        tokenId: string,
        side: OrderSide,
        initial?: HubOptions_Base<ChainId>,
    ): Promise<Pageable<NonFungibleTokenOrder<ChainId, SchemaType>>> {
        const options = this.HubOptions.fill(initial)
        const providers = this.getProviders(initial)
        return attemptUntil(
            providers.map((x) => () => x.getOrders?.(address, tokenId, side, options)),
            createPageable(EMPTY_LIST, createIndicator(options.indicator)),
            (result) => !result?.data.length,
        )
    }

    async getNonFungibleCollectionsByOwner(
        account: string,
        initial?: HubOptions_Base<ChainId>,
    ): Promise<Pageable<NonFungibleCollection<ChainId, SchemaType>>> {
        const options = this.HubOptions.fill(initial)
        const providers = this.getProviders(initial)
        return attemptUntil(
            providers.map((x) => () => x.getCollectionsByOwner?.(account, options)),
            createPageable(EMPTY_LIST, createIndicator(options.indicator)),
        )
    }

    async getNonFungibleCollectionVerifiedBy(id: string): Promise<string[]> {
        const providers = this.getProviders()
        return attemptUntil(
            providers.map((x) => () => x.getCollectionVerifiedBy?.(id)),
            [],
        )
    }

    async getNonFungibleTokenSecurity(
        chainId: ChainId,
        address: string,
        initial?: HubOptions_Base<ChainId>,
    ): Promise<NonFungibleTokenSecurity> {
        throw new Error('Method not implemented.')
    }

    async getNonFungibleTokenIconURLs(
        chainId: ChainId,
        address: string,
        tokenId?: string | undefined,
        initial?: HubOptions_Base<ChainId>,
    ): Promise<string[]> {
        throw new Error('Method not implemented.')
    }

    async getNonFungibleTokensFromTokenList(
        chainId: ChainId,
        initial?: HubOptions_Base<ChainId>,
    ): Promise<Array<NonFungibleToken<ChainId, SchemaType>>> {
        const options = this.HubOptions.fill({
            ...initial,
            chainId,
        })
        const providers = this.getProviders(initial)
        return attemptUntil(
            providers.map((x) => () => x.getNonFungibleTokenList?.(options.chainId)),
            EMPTY_LIST,
        )
    }

    async getNonFungibleTokenSpenders(
        chainId: ChainId,
        account: string,
        initial?: HubOptions_Base<ChainId>,
    ): Promise<Array<NonFungibleContractSpender<ChainId, SchemaType>>> {
        const options = this.HubOptions.fill({
            ...initial,
            chainId,
            account,
        })
        const providers = this.getProviders(initial)
        return attemptUntil(
            providers.map((x) => () => x.getNonFungibleTokenSpenders?.(options.chainId, options.account)),
            EMPTY_LIST,
            isEmpty,
        )
    }
}
