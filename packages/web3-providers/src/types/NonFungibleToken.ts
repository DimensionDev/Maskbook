import type {
    NonFungibleToken,
    NonFungibleAsset,
    Pageable,
    OrderSide,
    NonFungibleCollection,
    NonFungibleTokenContract,
    NonFungibleTokenOrder,
    NonFungibleTokenEvent,
    HubOptions,
    HubIndicator,
    NonFungibleTokenRarity,
    NonFungibleTokenStats,
    PriceInToken,
} from '@masknet/web3-shared-base'

export namespace NonFungibleTokenAPI {
    export interface Provider<ChainId, SchemaType, Indicator = HubIndicator> {
        /** Get balance of a fungible token owned by the given account. */
        getBalance?: (account: string, options?: HubOptions<ChainId, Indicator>) => Promise<number>
        /** Get a non-fungible rarity. */
        getRarity?: (
            address: string,
            tokenId: string,
            options?: HubOptions<ChainId, Indicator>,
        ) => Promise<NonFungibleTokenRarity | undefined>
        /** Get owner address. */
        getOwner?: (address: string, tokenId: string, options?: HubOptions<ChainId, Indicator>) => Promise<string>
        /** Get a non-fungible contract. */
        getContract?: (
            address: string,
            options?: HubOptions<ChainId>,
        ) => Promise<NonFungibleTokenContract<ChainId, SchemaType> | undefined>
        /** Get a non-fungible token floor price. */
        getFloorPrice?: (
            address: string,
            tokenId: string,
            options?: HubOptions<ChainId>,
        ) => Promise<PriceInToken<ChainId, SchemaType> | undefined>
        /** Get a non-fungible asset. */
        getAsset?: (
            address: string,
            tokenId: string,
            options?: HubOptions<ChainId>,
        ) => Promise<NonFungibleAsset<ChainId, SchemaType> | undefined>
        /** Get non-fungible assets owned by the given account. */
        getAssets?: (
            account: string,
            options?: HubOptions<ChainId>,
        ) => Promise<Pageable<NonFungibleAsset<ChainId, SchemaType>>>
        /** Get non-fungible assets of the given collection. */
        getAssetsByCollection?: (
            address: string,
            options?: HubOptions<ChainId>,
        ) => Promise<Pageable<NonFungibleAsset<ChainId, SchemaType>>>
        /**
         * @deprecated Use getAsset stead
         * Get a non-fungible token.
         * */
        getToken?: (
            address: string,
            tokenId: string,
            options?: HubOptions<ChainId>,
        ) => Promise<NonFungibleToken<ChainId, SchemaType> | undefined>
        /**
         * @deprecated Use getAssets stead
         * Get non-fungible tokens owned by the given account.
         * */
        getTokens?: (
            account: string,
            options?: HubOptions<ChainId, Indicator>,
        ) => Promise<Pageable<NonFungibleToken<ChainId, SchemaType>, Indicator>>
        /**
         * @deprecated Use getAssetsByCollection stead
         * Get non-fungible tokens of the given collection.
         * */
        getTokensByCollection?: (
            account: string,
            options?: HubOptions<ChainId, Indicator>,
        ) => Promise<Pageable<NonFungibleToken<ChainId, SchemaType>, Indicator>>
        /** Get non-fungible collection stats */
        getStats?: (
            address: string,
            options?: HubOptions<ChainId, Indicator>,
        ) => Promise<NonFungibleTokenStats | undefined>
        /** Get events of a non-fungible token. */
        getEvents?: (
            address: string,
            tokenId: string,
            options?: HubOptions<ChainId>,
        ) => Promise<Pageable<NonFungibleTokenEvent<ChainId, SchemaType>>>
        /** Get listed orders of a non-fungible token. */
        getListings?: (
            address: string,
            tokenId: string,
            options?: HubOptions<ChainId>,
        ) => Promise<Pageable<NonFungibleTokenOrder<ChainId, SchemaType>>>
        /** Get offered orders of a non-fungible token. */
        getOffers?: (
            address: string,
            tokenId: string,
            options?: HubOptions<ChainId>,
        ) => Promise<Pageable<NonFungibleTokenOrder<ChainId, SchemaType>>>
        /** Get orders of a non-fungible token. */
        getOrders?: (
            address: string,
            tokenId: string,
            side: OrderSide,
            options?: HubOptions<ChainId>,
        ) => Promise<Pageable<NonFungibleTokenOrder<ChainId, SchemaType>>>
        /** Get non-fungible collection by the given address. */
        getCollection?: (
            address: string,
            options?: HubOptions<ChainId, Indicator>,
        ) => Promise<NonFungibleCollection<ChainId, SchemaType> | undefined>
        /** Get non-fungible collections owned by the given account. */
        getCollectionsByOwner?: (
            account: string,
            options?: HubOptions<ChainId, Indicator>,
        ) => Promise<Pageable<NonFungibleCollection<ChainId, SchemaType>, Indicator>>
        /** Get non-fungible collections search by given keyword */
        getCollectionsByKeyword?: (
            keyword: string,
            options?: HubOptions<ChainId, Indicator>,
        ) => Promise<Pageable<NonFungibleCollection<ChainId, SchemaType>, Indicator>>

        /** Place a bid on a token. */
        createBuyOrder?: (/** TODO: add parameters */) => Promise<void>
        /** Listing a token for public sell. */
        createSellOrder?: (/** TODO: add parameters */) => Promise<void>
        /** Fulfill an order. */
        fulfillOrder?: (/** TODO: add parameters */) => Promise<void>
        /** Cancel an order. */
        cancelOrder?: (/** TODO: add parameters */) => Promise<void>
    }
}
