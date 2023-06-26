import type { PageIndicator, Pageable } from '@masknet/shared-base'
import type {
    NonFungibleAsset,
    OrderSide,
    NonFungibleCollection,
    NonFungibleTokenContract,
    NonFungibleTokenOrder,
    NonFungibleTokenEvent,
    NonFungibleTokenRarity,
    NonFungibleTokenStats,
    PriceInToken,
} from '@masknet/web3-shared-base'
import type { HubOptions_Base } from '../entry-types.js'

export namespace NonFungibleTokenAPI {
    export interface AttributesValue {
        attributes_value: string
        total: number
    }
    export interface Attributes {
        attributes_name: string
        attributes_values: AttributesValue[]
        total: number
    }
    export enum ErcType {
        ERC721 = 'erc721',
        ERC1155 = 'erc1155',
    }

    export interface Collection {
        contract_address: string
        name: string
        symbol: string
        description: string
        website: string | null
        email: string | null
        twitter: string | null
        discord: string | null
        telegram: string | null
        reddit: string | null
        github: string | null
        instagram: string | null
        medium: string | null
        youtube: string | null
        logo_url: string
        banner_url: string
        featured_url: string
        large_image_url: string
        attributes: Attributes[]
        erc_type: ErcType | string
        deploy_block_number: number
        owner: string
        verified: boolean
        opensea_verified: boolean
        items_total: number
        owners_total: number
        royalty: number
        opensea_floor_price: number
        floor_price: number
        price_symbol: string
        collections_with_same_name: []
    }
    export interface Provider<ChainId, SchemaType, Indicator = PageIndicator> {
        /** Get balance of a fungible token owned by the given account. */
        getBalance?: (account: string, options?: HubOptions_Base<ChainId, Indicator>) => Promise<number>
        /** Get owner address. */
        getOwner?: (address: string, tokenId: string, options?: HubOptions_Base<ChainId, Indicator>) => Promise<string>
        /** Get a non-fungible rarity. */
        getRarity?: (
            address: string,
            tokenId: string,
            options?: HubOptions_Base<ChainId, Indicator>,
        ) => Promise<NonFungibleTokenRarity<ChainId> | undefined>
        /** Get a non-fungible token floor price. */
        getFloorPrice?: (
            address: string,
            tokenId: string,
            options?: HubOptions_Base<ChainId>,
        ) => Promise<PriceInToken<ChainId, SchemaType> | undefined>
        /** Get a non-fungible contract. */
        getContract?: (
            address: string,
            options?: HubOptions_Base<ChainId>,
        ) => Promise<NonFungibleTokenContract<ChainId, SchemaType> | undefined>
        /** Get a non-fungible asset. */
        getAsset?: (
            address: string,
            tokenId: string,
            options?: HubOptions_Base<ChainId>,
        ) => Promise<NonFungibleAsset<ChainId, SchemaType> | undefined>
        /** Get non-fungible assets owned by the given account. */
        getAssets?: (
            account: string,
            options?: HubOptions_Base<ChainId>,
        ) => Promise<Pageable<NonFungibleAsset<ChainId, SchemaType>>>
        /** Get non-fungible assets of the given collection. */
        getAssetsByCollection?: (
            address: string,
            options?: HubOptions_Base<ChainId>,
        ) => Promise<Pageable<NonFungibleAsset<ChainId, SchemaType>> | undefined>
        /** Get non-fungible assets of the given collection and owner. */
        getAssetsByCollectionAndOwner?: (
            collectionId: string,
            owner: string,
            options?: HubOptions_Base<ChainId>,
        ) => Promise<Pageable<NonFungibleAsset<ChainId, SchemaType>>>
        /** Get non-fungible collection stats */
        getStats?: (
            address: string,
            options?: HubOptions_Base<ChainId, Indicator>,
        ) => Promise<NonFungibleTokenStats | undefined>
        /** Get events of a non-fungible token. */
        getEvents?: (
            address: string,
            tokenId: string,
            options?: HubOptions_Base<ChainId>,
        ) => Promise<Pageable<NonFungibleTokenEvent<ChainId, SchemaType>>>
        /** Get listed orders of a non-fungible token. */
        getListings?: (
            address: string,
            tokenId: string,
            options?: HubOptions_Base<ChainId>,
        ) => Promise<Pageable<NonFungibleTokenOrder<ChainId, SchemaType>>>
        /** Get offered orders of a non-fungible token. */
        getOffers?: (
            address: string,
            tokenId: string,
            options?: HubOptions_Base<ChainId>,
        ) => Promise<Pageable<NonFungibleTokenOrder<ChainId, SchemaType>>>
        /** Get orders of a non-fungible token. */
        getOrders?: (
            address: string,
            tokenId: string,
            side: OrderSide,
            options?: HubOptions_Base<ChainId>,
        ) => Promise<Pageable<NonFungibleTokenOrder<ChainId, SchemaType>>>
        /** Get non-fungible collection by the given address. */
        getCollection?: (
            address: string,
            options?: HubOptions_Base<ChainId, Indicator>,
        ) => Promise<NonFungibleCollection<ChainId, SchemaType> | undefined>
        /** Get non-fungible collections owned by the given account. */
        getCollectionsByOwner?: (
            account: string,
            options?: HubOptions_Base<ChainId, Indicator>,
        ) => Promise<Pageable<NonFungibleCollection<ChainId, SchemaType>, Indicator>>
        /** Get collection verified-by by provider-defined id. */
        getCollectionVerifiedBy?: (id: string) => Promise<string[]>

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
