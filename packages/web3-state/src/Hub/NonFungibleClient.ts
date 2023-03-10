import {
    type HubOptions,
    type NonFungibleAsset,
    attemptUntil,
    type Pageable,
    createPageable,
    createIndicator,
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
import { EMPTY_LIST } from '@masknet/shared-base'
import type { AuthorizationAPI, NonFungibleTokenAPI, TokenListAPI } from '@masknet/web3-providers/types'
import { HubStateBaseClient } from '../Hub.js'

export class HubStateNonFungibleClient<ChainId, SchemaType> extends HubStateBaseClient<ChainId> {
    protected getProviders(
        initial?: HubOptions<ChainId>,
    ): Array<
        AuthorizationAPI.Provider<ChainId> &
            NonFungibleTokenAPI.Provider<ChainId, SchemaType> &
            TokenListAPI.Provider<ChainId, SchemaType>
    > {
        throw new Error('Method not implemented.')
    }

    async getNonFungibleTokenBalance(address: string, initial?: HubOptions<ChainId> | undefined): Promise<number> {
        throw new Error('Method not implemented.')
    }

    async getNonFungibleRarity(
        address: string,
        tokenId: string,
        initial?: HubOptions<ChainId>,
    ): Promise<NonFungibleTokenRarity<ChainId> | undefined> {
        const options = this.getOptions(initial)
        const providers = this.getProviders(initial)
        return attemptUntil(
            providers.map((x) => () => x.getRarity?.(address, tokenId, options)),
            undefined,
        )
    }

    async getNonFungibleAsset(
        address: string,
        tokenId: string,
        initial?: HubOptions<ChainId>,
    ): Promise<NonFungibleAsset<ChainId, SchemaType> | undefined> {
        const options = this.getOptions(initial)
        const providers = this.getProviders(initial)
        return attemptUntil(
            providers.map((x) => () => x.getAsset?.(address, tokenId, options)),
            undefined,
        )
    }

    async getNonFungibleAssets(
        account: string,
        initial?: HubOptions<ChainId>,
    ): Promise<Pageable<NonFungibleAsset<ChainId, SchemaType>>> {
        const options = this.getOptions(initial, {
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
        initial?: HubOptions<ChainId>,
    ): Promise<PriceInToken<ChainId, SchemaType> | undefined> {
        const options = this.getOptions(initial)
        const providers = this.getProviders(initial)
        return attemptUntil(
            providers.map((x) => () => x.getFloorPrice?.(address, tokenId, options)),
            undefined,
        )
    }

    async getNonFungibleAssetsByCollection(
        id: string,
        initial?: HubOptions<ChainId>,
    ): Promise<Pageable<NonFungibleAsset<ChainId, SchemaType>>> {
        const options = this.getOptions(initial)
        const providers = this.getProviders(initial)
        return attemptUntil(
            providers.map((x) => () => x.getAssetsByCollection?.(id, options)),
            createPageable(EMPTY_LIST, createIndicator(options.indicator)),
        )
    }

    async getNonFungibleAssetsByCollectionAndOwner(
        collectionId: string,
        owner: string,
        initial?: HubOptions<ChainId>,
    ): Promise<Pageable<NonFungibleAsset<ChainId, SchemaType>>> {
        const options = this.getOptions(initial)
        const providers = this.getProviders(initial)
        return attemptUntil(
            providers.map((x) => () => x.getAssetsByCollectionAndOwner?.(collectionId, owner, options)),
            createPageable(EMPTY_LIST, createIndicator(options.indicator)),
        )
    }

    async getNonFungibleTokenContract(
        address: string,
        initial?: HubOptions<ChainId>,
    ): Promise<NonFungibleTokenContract<ChainId, SchemaType> | undefined> {
        const options = this.getOptions(initial)
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
        initial?: HubOptions<ChainId>,
    ): Promise<never> {
        throw new Error('Method not implemented.')
    }

    async getNonFungibleTokenEvents(
        address: string,
        tokenId: string,
        initial?: HubOptions<ChainId> | undefined,
    ): Promise<Pageable<NonFungibleTokenEvent<ChainId, SchemaType>>> {
        const options = this.getOptions(initial)
        const providers = this.getProviders(initial)
        return attemptUntil(
            providers.map((x) => () => x.getEvents?.(address, tokenId, options)),
            createPageable(EMPTY_LIST, createIndicator(options.indicator)),
        )
    }

    async getNonFungibleTokenListings(
        address: string,
        tokenId: string,
        initial?: HubOptions<ChainId> | undefined,
    ): Promise<Pageable<NonFungibleTokenOrder<ChainId, SchemaType>>> {
        const options = this.getOptions(initial)
        const providers = this.getProviders(initial)
        return attemptUntil(
            providers.map((x) => () => x.getListings?.(address, tokenId, options)),
            createPageable(EMPTY_LIST, createIndicator(options.indicator)),
        )
    }

    async getNonFungibleTokenOffers(
        address: string,
        tokenId: string,
        initial?: HubOptions<ChainId> | undefined,
    ): Promise<Pageable<NonFungibleTokenOrder<ChainId, SchemaType>>> {
        const options = this.getOptions(initial)
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
        initial?: HubOptions<ChainId> | undefined,
    ): Promise<Pageable<NonFungibleTokenOrder<ChainId, SchemaType>>> {
        const options = this.getOptions(initial)
        const providers = this.getProviders(initial)
        return attemptUntil(
            providers.map((x) => () => x.getOrders?.(address, tokenId, side, options)),
            createPageable(EMPTY_LIST, createIndicator(options.indicator)),
        )
    }

    async getNonFungibleCollectionsByOwner(
        account: string,
        initial?: HubOptions<ChainId>,
    ): Promise<Pageable<NonFungibleCollection<ChainId, SchemaType>>> {
        const options = this.getOptions(initial)
        const providers = this.getProviders(initial)
        return attemptUntil(
            providers.map((x) => () => x.getCollectionsByOwner?.(account, options)),
            createPageable(EMPTY_LIST, createIndicator(options.indicator)),
        )
    }

    async getNonFungibleTokenSecurity(
        chainId: ChainId,
        address: string,
        initial?: HubOptions<ChainId>,
    ): Promise<NonFungibleTokenSecurity> {
        throw new Error('Method not implemented.')
    }

    async getNonFungibleTokenIconURLs(
        chainId: ChainId,
        address: string,
        tokenId?: string | undefined,
        initial?: HubOptions<ChainId>,
    ): Promise<string[]> {
        throw new Error('Method not implemented.')
    }

    async getNonFungibleTokensFromTokenList(
        chainId: ChainId,
        initial?: HubOptions<ChainId>,
    ): Promise<Array<NonFungibleToken<ChainId, SchemaType>>> {
        const options = this.getOptions(initial, {
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
        initial?: HubOptions<ChainId>,
    ): Promise<Array<NonFungibleContractSpender<ChainId, SchemaType>>> {
        const options = this.getOptions(initial, {
            chainId,
            account,
        })
        const providers = this.getProviders(initial)
        return attemptUntil(
            providers.map((x) => () => x.getNonFungibleTokenSpenders?.(options.chainId, options.account)),
            EMPTY_LIST,
        )
    }
}
