import { GraphQLClient } from 'graphql-request'
import * as Dom from 'graphql-request/dist/types.dom'
import gql from 'graphql-tag'
export type Maybe<T> = T | null
export type InputMaybe<T> = Maybe<T>
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] }
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> }
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> }
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
    ID: string
    String: string
    Boolean: boolean
    Int: number
    Float: number
    BigDecimal: string
    BigInt: string
    Bytes: string
}

export type Attribute = {
    __typename?: 'Attribute'
    /** Internal for tracking tokenIds calculated */
    _tokenIds: Array<Scalars['String']>
    collection: Collection
    id: Scalars['ID']
    metadata: Array<MetadataAttribute>
    name: Scalars['String']
    percentage?: Maybe<Scalars['BigDecimal']>
    value: Scalars['String']
}

export type AttributeMetadataArgs = {
    first?: InputMaybe<Scalars['Int']>
    orderBy?: InputMaybe<MetadataAttribute_OrderBy>
    orderDirection?: InputMaybe<OrderDirection>
    skip?: InputMaybe<Scalars['Int']>
    where?: InputMaybe<MetadataAttribute_Filter>
}

export type Attribute_Filter = {
    /** Filter for the block changed event. */
    _change_block?: InputMaybe<BlockChangedFilter>
    _tokenIds?: InputMaybe<Array<Scalars['String']>>
    _tokenIds_contains?: InputMaybe<Array<Scalars['String']>>
    _tokenIds_contains_nocase?: InputMaybe<Array<Scalars['String']>>
    _tokenIds_not?: InputMaybe<Array<Scalars['String']>>
    _tokenIds_not_contains?: InputMaybe<Array<Scalars['String']>>
    _tokenIds_not_contains_nocase?: InputMaybe<Array<Scalars['String']>>
    collection?: InputMaybe<Scalars['String']>
    collection_contains?: InputMaybe<Scalars['String']>
    collection_contains_nocase?: InputMaybe<Scalars['String']>
    collection_ends_with?: InputMaybe<Scalars['String']>
    collection_ends_with_nocase?: InputMaybe<Scalars['String']>
    collection_gt?: InputMaybe<Scalars['String']>
    collection_gte?: InputMaybe<Scalars['String']>
    collection_in?: InputMaybe<Array<Scalars['String']>>
    collection_lt?: InputMaybe<Scalars['String']>
    collection_lte?: InputMaybe<Scalars['String']>
    collection_not?: InputMaybe<Scalars['String']>
    collection_not_contains?: InputMaybe<Scalars['String']>
    collection_not_contains_nocase?: InputMaybe<Scalars['String']>
    collection_not_ends_with?: InputMaybe<Scalars['String']>
    collection_not_ends_with_nocase?: InputMaybe<Scalars['String']>
    collection_not_in?: InputMaybe<Array<Scalars['String']>>
    collection_not_starts_with?: InputMaybe<Scalars['String']>
    collection_not_starts_with_nocase?: InputMaybe<Scalars['String']>
    collection_starts_with?: InputMaybe<Scalars['String']>
    collection_starts_with_nocase?: InputMaybe<Scalars['String']>
    id?: InputMaybe<Scalars['ID']>
    id_gt?: InputMaybe<Scalars['ID']>
    id_gte?: InputMaybe<Scalars['ID']>
    id_in?: InputMaybe<Array<Scalars['ID']>>
    id_lt?: InputMaybe<Scalars['ID']>
    id_lte?: InputMaybe<Scalars['ID']>
    id_not?: InputMaybe<Scalars['ID']>
    id_not_in?: InputMaybe<Array<Scalars['ID']>>
    name?: InputMaybe<Scalars['String']>
    name_contains?: InputMaybe<Scalars['String']>
    name_contains_nocase?: InputMaybe<Scalars['String']>
    name_ends_with?: InputMaybe<Scalars['String']>
    name_ends_with_nocase?: InputMaybe<Scalars['String']>
    name_gt?: InputMaybe<Scalars['String']>
    name_gte?: InputMaybe<Scalars['String']>
    name_in?: InputMaybe<Array<Scalars['String']>>
    name_lt?: InputMaybe<Scalars['String']>
    name_lte?: InputMaybe<Scalars['String']>
    name_not?: InputMaybe<Scalars['String']>
    name_not_contains?: InputMaybe<Scalars['String']>
    name_not_contains_nocase?: InputMaybe<Scalars['String']>
    name_not_ends_with?: InputMaybe<Scalars['String']>
    name_not_ends_with_nocase?: InputMaybe<Scalars['String']>
    name_not_in?: InputMaybe<Array<Scalars['String']>>
    name_not_starts_with?: InputMaybe<Scalars['String']>
    name_not_starts_with_nocase?: InputMaybe<Scalars['String']>
    name_starts_with?: InputMaybe<Scalars['String']>
    name_starts_with_nocase?: InputMaybe<Scalars['String']>
    percentage?: InputMaybe<Scalars['BigDecimal']>
    percentage_gt?: InputMaybe<Scalars['BigDecimal']>
    percentage_gte?: InputMaybe<Scalars['BigDecimal']>
    percentage_in?: InputMaybe<Array<Scalars['BigDecimal']>>
    percentage_lt?: InputMaybe<Scalars['BigDecimal']>
    percentage_lte?: InputMaybe<Scalars['BigDecimal']>
    percentage_not?: InputMaybe<Scalars['BigDecimal']>
    percentage_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>
    value?: InputMaybe<Scalars['String']>
    value_contains?: InputMaybe<Scalars['String']>
    value_contains_nocase?: InputMaybe<Scalars['String']>
    value_ends_with?: InputMaybe<Scalars['String']>
    value_ends_with_nocase?: InputMaybe<Scalars['String']>
    value_gt?: InputMaybe<Scalars['String']>
    value_gte?: InputMaybe<Scalars['String']>
    value_in?: InputMaybe<Array<Scalars['String']>>
    value_lt?: InputMaybe<Scalars['String']>
    value_lte?: InputMaybe<Scalars['String']>
    value_not?: InputMaybe<Scalars['String']>
    value_not_contains?: InputMaybe<Scalars['String']>
    value_not_contains_nocase?: InputMaybe<Scalars['String']>
    value_not_ends_with?: InputMaybe<Scalars['String']>
    value_not_ends_with_nocase?: InputMaybe<Scalars['String']>
    value_not_in?: InputMaybe<Array<Scalars['String']>>
    value_not_starts_with?: InputMaybe<Scalars['String']>
    value_not_starts_with_nocase?: InputMaybe<Scalars['String']>
    value_starts_with?: InputMaybe<Scalars['String']>
    value_starts_with_nocase?: InputMaybe<Scalars['String']>
}

export enum Attribute_OrderBy {
    _tokenIds = '_tokenIds',
    collection = 'collection',
    id = 'id',
    metadata = 'metadata',
    name = 'name',
    percentage = 'percentage',
    value = 'value',
}

export type BlockChangedFilter = {
    number_gte: Scalars['Int']
}

export type Block_Height = {
    hash?: InputMaybe<Scalars['Bytes']>
    number?: InputMaybe<Scalars['Int']>
    number_gte?: InputMaybe<Scalars['Int']>
}

export type Collection = {
    __typename?: 'Collection'
    /** Internal for tracking attributes for a collection */
    _attributeIds: Array<Scalars['String']>
    /** Internal for tracking listings */
    _listingIds: Array<Scalars['String']>
    /** Internal for tracking metadata failures to retry */
    _missingMetadataIds: Array<Scalars['String']>
    /** Internal for tracking owners of tokens for a collection */
    _owners: Array<Scalars['String']>
    /** Internal for tracking tokenIds minted for a collection */
    _tokenIds: Array<Scalars['String']>
    address: Scalars['Bytes']
    /** Used to determine possible filters for collection */
    attributes?: Maybe<Array<Attribute>>
    creator: Creator
    floorPrice: Scalars['BigInt']
    id: Scalars['ID']
    listings: Array<Listing>
    name: Scalars['String']
    standard?: Maybe<TokenStandard>
    symbol?: Maybe<Scalars['String']>
    tokens: Array<Token>
    totalItems: Scalars['BigInt']
    totalListings: Scalars['BigInt']
    totalOwners: Scalars['BigInt']
    totalSales: Scalars['BigInt']
    totalVolume: Scalars['BigInt']
}

export type CollectionAttributesArgs = {
    first?: InputMaybe<Scalars['Int']>
    orderBy?: InputMaybe<Attribute_OrderBy>
    orderDirection?: InputMaybe<OrderDirection>
    skip?: InputMaybe<Scalars['Int']>
    where?: InputMaybe<Attribute_Filter>
}

export type CollectionListingsArgs = {
    first?: InputMaybe<Scalars['Int']>
    orderBy?: InputMaybe<Listing_OrderBy>
    orderDirection?: InputMaybe<OrderDirection>
    skip?: InputMaybe<Scalars['Int']>
    where?: InputMaybe<Listing_Filter>
}

export type CollectionTokensArgs = {
    first?: InputMaybe<Scalars['Int']>
    orderBy?: InputMaybe<Token_OrderBy>
    orderDirection?: InputMaybe<OrderDirection>
    skip?: InputMaybe<Scalars['Int']>
    where?: InputMaybe<Token_Filter>
}

export type Collection_Filter = {
    _attributeIds?: InputMaybe<Array<Scalars['String']>>
    _attributeIds_contains?: InputMaybe<Array<Scalars['String']>>
    _attributeIds_contains_nocase?: InputMaybe<Array<Scalars['String']>>
    _attributeIds_not?: InputMaybe<Array<Scalars['String']>>
    _attributeIds_not_contains?: InputMaybe<Array<Scalars['String']>>
    _attributeIds_not_contains_nocase?: InputMaybe<Array<Scalars['String']>>
    /** Filter for the block changed event. */
    _change_block?: InputMaybe<BlockChangedFilter>
    _listingIds?: InputMaybe<Array<Scalars['String']>>
    _listingIds_contains?: InputMaybe<Array<Scalars['String']>>
    _listingIds_contains_nocase?: InputMaybe<Array<Scalars['String']>>
    _listingIds_not?: InputMaybe<Array<Scalars['String']>>
    _listingIds_not_contains?: InputMaybe<Array<Scalars['String']>>
    _listingIds_not_contains_nocase?: InputMaybe<Array<Scalars['String']>>
    _missingMetadataIds?: InputMaybe<Array<Scalars['String']>>
    _missingMetadataIds_contains?: InputMaybe<Array<Scalars['String']>>
    _missingMetadataIds_contains_nocase?: InputMaybe<Array<Scalars['String']>>
    _missingMetadataIds_not?: InputMaybe<Array<Scalars['String']>>
    _missingMetadataIds_not_contains?: InputMaybe<Array<Scalars['String']>>
    _missingMetadataIds_not_contains_nocase?: InputMaybe<Array<Scalars['String']>>
    _owners?: InputMaybe<Array<Scalars['String']>>
    _owners_contains?: InputMaybe<Array<Scalars['String']>>
    _owners_contains_nocase?: InputMaybe<Array<Scalars['String']>>
    _owners_not?: InputMaybe<Array<Scalars['String']>>
    _owners_not_contains?: InputMaybe<Array<Scalars['String']>>
    _owners_not_contains_nocase?: InputMaybe<Array<Scalars['String']>>
    _tokenIds?: InputMaybe<Array<Scalars['String']>>
    _tokenIds_contains?: InputMaybe<Array<Scalars['String']>>
    _tokenIds_contains_nocase?: InputMaybe<Array<Scalars['String']>>
    _tokenIds_not?: InputMaybe<Array<Scalars['String']>>
    _tokenIds_not_contains?: InputMaybe<Array<Scalars['String']>>
    _tokenIds_not_contains_nocase?: InputMaybe<Array<Scalars['String']>>
    address?: InputMaybe<Scalars['Bytes']>
    address_contains?: InputMaybe<Scalars['Bytes']>
    address_in?: InputMaybe<Array<Scalars['Bytes']>>
    address_not?: InputMaybe<Scalars['Bytes']>
    address_not_contains?: InputMaybe<Scalars['Bytes']>
    address_not_in?: InputMaybe<Array<Scalars['Bytes']>>
    creator?: InputMaybe<Scalars['String']>
    creator_contains?: InputMaybe<Scalars['String']>
    creator_contains_nocase?: InputMaybe<Scalars['String']>
    creator_ends_with?: InputMaybe<Scalars['String']>
    creator_ends_with_nocase?: InputMaybe<Scalars['String']>
    creator_gt?: InputMaybe<Scalars['String']>
    creator_gte?: InputMaybe<Scalars['String']>
    creator_in?: InputMaybe<Array<Scalars['String']>>
    creator_lt?: InputMaybe<Scalars['String']>
    creator_lte?: InputMaybe<Scalars['String']>
    creator_not?: InputMaybe<Scalars['String']>
    creator_not_contains?: InputMaybe<Scalars['String']>
    creator_not_contains_nocase?: InputMaybe<Scalars['String']>
    creator_not_ends_with?: InputMaybe<Scalars['String']>
    creator_not_ends_with_nocase?: InputMaybe<Scalars['String']>
    creator_not_in?: InputMaybe<Array<Scalars['String']>>
    creator_not_starts_with?: InputMaybe<Scalars['String']>
    creator_not_starts_with_nocase?: InputMaybe<Scalars['String']>
    creator_starts_with?: InputMaybe<Scalars['String']>
    creator_starts_with_nocase?: InputMaybe<Scalars['String']>
    floorPrice?: InputMaybe<Scalars['BigInt']>
    floorPrice_gt?: InputMaybe<Scalars['BigInt']>
    floorPrice_gte?: InputMaybe<Scalars['BigInt']>
    floorPrice_in?: InputMaybe<Array<Scalars['BigInt']>>
    floorPrice_lt?: InputMaybe<Scalars['BigInt']>
    floorPrice_lte?: InputMaybe<Scalars['BigInt']>
    floorPrice_not?: InputMaybe<Scalars['BigInt']>
    floorPrice_not_in?: InputMaybe<Array<Scalars['BigInt']>>
    id?: InputMaybe<Scalars['ID']>
    id_gt?: InputMaybe<Scalars['ID']>
    id_gte?: InputMaybe<Scalars['ID']>
    id_in?: InputMaybe<Array<Scalars['ID']>>
    id_lt?: InputMaybe<Scalars['ID']>
    id_lte?: InputMaybe<Scalars['ID']>
    id_not?: InputMaybe<Scalars['ID']>
    id_not_in?: InputMaybe<Array<Scalars['ID']>>
    name?: InputMaybe<Scalars['String']>
    name_contains?: InputMaybe<Scalars['String']>
    name_contains_nocase?: InputMaybe<Scalars['String']>
    name_ends_with?: InputMaybe<Scalars['String']>
    name_ends_with_nocase?: InputMaybe<Scalars['String']>
    name_gt?: InputMaybe<Scalars['String']>
    name_gte?: InputMaybe<Scalars['String']>
    name_in?: InputMaybe<Array<Scalars['String']>>
    name_lt?: InputMaybe<Scalars['String']>
    name_lte?: InputMaybe<Scalars['String']>
    name_not?: InputMaybe<Scalars['String']>
    name_not_contains?: InputMaybe<Scalars['String']>
    name_not_contains_nocase?: InputMaybe<Scalars['String']>
    name_not_ends_with?: InputMaybe<Scalars['String']>
    name_not_ends_with_nocase?: InputMaybe<Scalars['String']>
    name_not_in?: InputMaybe<Array<Scalars['String']>>
    name_not_starts_with?: InputMaybe<Scalars['String']>
    name_not_starts_with_nocase?: InputMaybe<Scalars['String']>
    name_starts_with?: InputMaybe<Scalars['String']>
    name_starts_with_nocase?: InputMaybe<Scalars['String']>
    standard?: InputMaybe<TokenStandard>
    standard_in?: InputMaybe<Array<TokenStandard>>
    standard_not?: InputMaybe<TokenStandard>
    standard_not_in?: InputMaybe<Array<TokenStandard>>
    symbol?: InputMaybe<Scalars['String']>
    symbol_contains?: InputMaybe<Scalars['String']>
    symbol_contains_nocase?: InputMaybe<Scalars['String']>
    symbol_ends_with?: InputMaybe<Scalars['String']>
    symbol_ends_with_nocase?: InputMaybe<Scalars['String']>
    symbol_gt?: InputMaybe<Scalars['String']>
    symbol_gte?: InputMaybe<Scalars['String']>
    symbol_in?: InputMaybe<Array<Scalars['String']>>
    symbol_lt?: InputMaybe<Scalars['String']>
    symbol_lte?: InputMaybe<Scalars['String']>
    symbol_not?: InputMaybe<Scalars['String']>
    symbol_not_contains?: InputMaybe<Scalars['String']>
    symbol_not_contains_nocase?: InputMaybe<Scalars['String']>
    symbol_not_ends_with?: InputMaybe<Scalars['String']>
    symbol_not_ends_with_nocase?: InputMaybe<Scalars['String']>
    symbol_not_in?: InputMaybe<Array<Scalars['String']>>
    symbol_not_starts_with?: InputMaybe<Scalars['String']>
    symbol_not_starts_with_nocase?: InputMaybe<Scalars['String']>
    symbol_starts_with?: InputMaybe<Scalars['String']>
    symbol_starts_with_nocase?: InputMaybe<Scalars['String']>
    totalItems?: InputMaybe<Scalars['BigInt']>
    totalItems_gt?: InputMaybe<Scalars['BigInt']>
    totalItems_gte?: InputMaybe<Scalars['BigInt']>
    totalItems_in?: InputMaybe<Array<Scalars['BigInt']>>
    totalItems_lt?: InputMaybe<Scalars['BigInt']>
    totalItems_lte?: InputMaybe<Scalars['BigInt']>
    totalItems_not?: InputMaybe<Scalars['BigInt']>
    totalItems_not_in?: InputMaybe<Array<Scalars['BigInt']>>
    totalListings?: InputMaybe<Scalars['BigInt']>
    totalListings_gt?: InputMaybe<Scalars['BigInt']>
    totalListings_gte?: InputMaybe<Scalars['BigInt']>
    totalListings_in?: InputMaybe<Array<Scalars['BigInt']>>
    totalListings_lt?: InputMaybe<Scalars['BigInt']>
    totalListings_lte?: InputMaybe<Scalars['BigInt']>
    totalListings_not?: InputMaybe<Scalars['BigInt']>
    totalListings_not_in?: InputMaybe<Array<Scalars['BigInt']>>
    totalOwners?: InputMaybe<Scalars['BigInt']>
    totalOwners_gt?: InputMaybe<Scalars['BigInt']>
    totalOwners_gte?: InputMaybe<Scalars['BigInt']>
    totalOwners_in?: InputMaybe<Array<Scalars['BigInt']>>
    totalOwners_lt?: InputMaybe<Scalars['BigInt']>
    totalOwners_lte?: InputMaybe<Scalars['BigInt']>
    totalOwners_not?: InputMaybe<Scalars['BigInt']>
    totalOwners_not_in?: InputMaybe<Array<Scalars['BigInt']>>
    totalSales?: InputMaybe<Scalars['BigInt']>
    totalSales_gt?: InputMaybe<Scalars['BigInt']>
    totalSales_gte?: InputMaybe<Scalars['BigInt']>
    totalSales_in?: InputMaybe<Array<Scalars['BigInt']>>
    totalSales_lt?: InputMaybe<Scalars['BigInt']>
    totalSales_lte?: InputMaybe<Scalars['BigInt']>
    totalSales_not?: InputMaybe<Scalars['BigInt']>
    totalSales_not_in?: InputMaybe<Array<Scalars['BigInt']>>
    totalVolume?: InputMaybe<Scalars['BigInt']>
    totalVolume_gt?: InputMaybe<Scalars['BigInt']>
    totalVolume_gte?: InputMaybe<Scalars['BigInt']>
    totalVolume_in?: InputMaybe<Array<Scalars['BigInt']>>
    totalVolume_lt?: InputMaybe<Scalars['BigInt']>
    totalVolume_lte?: InputMaybe<Scalars['BigInt']>
    totalVolume_not?: InputMaybe<Scalars['BigInt']>
    totalVolume_not_in?: InputMaybe<Array<Scalars['BigInt']>>
}

export enum Collection_OrderBy {
    _attributeIds = '_attributeIds',
    _listingIds = '_listingIds',
    _missingMetadataIds = '_missingMetadataIds',
    _owners = '_owners',
    _tokenIds = '_tokenIds',
    address = 'address',
    attributes = 'attributes',
    creator = 'creator',
    floorPrice = 'floorPrice',
    id = 'id',
    listings = 'listings',
    name = 'name',
    standard = 'standard',
    symbol = 'symbol',
    tokens = 'tokens',
    totalItems = 'totalItems',
    totalListings = 'totalListings',
    totalOwners = 'totalOwners',
    totalSales = 'totalSales',
    totalVolume = 'totalVolume',
}

export type Creator = {
    __typename?: 'Creator'
    collections: Array<Collection>
    fee: Scalars['BigDecimal']
    id: Scalars['ID']
    name: Scalars['String']
}

export type CreatorCollectionsArgs = {
    first?: InputMaybe<Scalars['Int']>
    orderBy?: InputMaybe<Collection_OrderBy>
    orderDirection?: InputMaybe<OrderDirection>
    skip?: InputMaybe<Scalars['Int']>
    where?: InputMaybe<Collection_Filter>
}

export type Creator_Filter = {
    /** Filter for the block changed event. */
    _change_block?: InputMaybe<BlockChangedFilter>
    fee?: InputMaybe<Scalars['BigDecimal']>
    fee_gt?: InputMaybe<Scalars['BigDecimal']>
    fee_gte?: InputMaybe<Scalars['BigDecimal']>
    fee_in?: InputMaybe<Array<Scalars['BigDecimal']>>
    fee_lt?: InputMaybe<Scalars['BigDecimal']>
    fee_lte?: InputMaybe<Scalars['BigDecimal']>
    fee_not?: InputMaybe<Scalars['BigDecimal']>
    fee_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>
    id?: InputMaybe<Scalars['ID']>
    id_gt?: InputMaybe<Scalars['ID']>
    id_gte?: InputMaybe<Scalars['ID']>
    id_in?: InputMaybe<Array<Scalars['ID']>>
    id_lt?: InputMaybe<Scalars['ID']>
    id_lte?: InputMaybe<Scalars['ID']>
    id_not?: InputMaybe<Scalars['ID']>
    id_not_in?: InputMaybe<Array<Scalars['ID']>>
    name?: InputMaybe<Scalars['String']>
    name_contains?: InputMaybe<Scalars['String']>
    name_contains_nocase?: InputMaybe<Scalars['String']>
    name_ends_with?: InputMaybe<Scalars['String']>
    name_ends_with_nocase?: InputMaybe<Scalars['String']>
    name_gt?: InputMaybe<Scalars['String']>
    name_gte?: InputMaybe<Scalars['String']>
    name_in?: InputMaybe<Array<Scalars['String']>>
    name_lt?: InputMaybe<Scalars['String']>
    name_lte?: InputMaybe<Scalars['String']>
    name_not?: InputMaybe<Scalars['String']>
    name_not_contains?: InputMaybe<Scalars['String']>
    name_not_contains_nocase?: InputMaybe<Scalars['String']>
    name_not_ends_with?: InputMaybe<Scalars['String']>
    name_not_ends_with_nocase?: InputMaybe<Scalars['String']>
    name_not_in?: InputMaybe<Array<Scalars['String']>>
    name_not_starts_with?: InputMaybe<Scalars['String']>
    name_not_starts_with_nocase?: InputMaybe<Scalars['String']>
    name_starts_with?: InputMaybe<Scalars['String']>
    name_starts_with_nocase?: InputMaybe<Scalars['String']>
}

export enum Creator_OrderBy {
    collections = 'collections',
    fee = 'fee',
    id = 'id',
    name = 'name',
}

export type Exerciser = {
    __typename?: 'Exerciser'
    id: Scalars['ID']
}

export type Exerciser_Filter = {
    /** Filter for the block changed event. */
    _change_block?: InputMaybe<BlockChangedFilter>
    id?: InputMaybe<Scalars['ID']>
    id_gt?: InputMaybe<Scalars['ID']>
    id_gte?: InputMaybe<Scalars['ID']>
    id_in?: InputMaybe<Array<Scalars['ID']>>
    id_lt?: InputMaybe<Scalars['ID']>
    id_lte?: InputMaybe<Scalars['ID']>
    id_not?: InputMaybe<Scalars['ID']>
    id_not_in?: InputMaybe<Array<Scalars['ID']>>
}

export enum Exerciser_OrderBy {
    id = 'id',
}

export type Listing = {
    __typename?: 'Listing'
    /** Track originally listed quantity, needed when staking Treasures */
    _listedQuantity: Scalars['BigInt']
    blockTimestamp: Scalars['BigInt']
    buyer?: Maybe<User>
    collection: Collection
    collectionName: Scalars['String']
    expires: Scalars['BigInt']
    /** Used to support multiple filters with metadata attributes */
    filters?: Maybe<Array<Scalars['String']>>
    id: Scalars['ID']
    nicePrice?: Maybe<Scalars['String']>
    pricePerItem: Scalars['BigInt']
    quantity: Scalars['BigInt']
    seller: User
    status: Status
    token: Token
    tokenName?: Maybe<Scalars['String']>
    totalPrice?: Maybe<Scalars['String']>
    transactionLink?: Maybe<Scalars['String']>
    /** deprecated: use seller field */
    user: User
}

export type Listing_Filter = {
    /** Filter for the block changed event. */
    _change_block?: InputMaybe<BlockChangedFilter>
    _listedQuantity?: InputMaybe<Scalars['BigInt']>
    _listedQuantity_gt?: InputMaybe<Scalars['BigInt']>
    _listedQuantity_gte?: InputMaybe<Scalars['BigInt']>
    _listedQuantity_in?: InputMaybe<Array<Scalars['BigInt']>>
    _listedQuantity_lt?: InputMaybe<Scalars['BigInt']>
    _listedQuantity_lte?: InputMaybe<Scalars['BigInt']>
    _listedQuantity_not?: InputMaybe<Scalars['BigInt']>
    _listedQuantity_not_in?: InputMaybe<Array<Scalars['BigInt']>>
    blockTimestamp?: InputMaybe<Scalars['BigInt']>
    blockTimestamp_gt?: InputMaybe<Scalars['BigInt']>
    blockTimestamp_gte?: InputMaybe<Scalars['BigInt']>
    blockTimestamp_in?: InputMaybe<Array<Scalars['BigInt']>>
    blockTimestamp_lt?: InputMaybe<Scalars['BigInt']>
    blockTimestamp_lte?: InputMaybe<Scalars['BigInt']>
    blockTimestamp_not?: InputMaybe<Scalars['BigInt']>
    blockTimestamp_not_in?: InputMaybe<Array<Scalars['BigInt']>>
    buyer?: InputMaybe<Scalars['String']>
    buyer_contains?: InputMaybe<Scalars['String']>
    buyer_contains_nocase?: InputMaybe<Scalars['String']>
    buyer_ends_with?: InputMaybe<Scalars['String']>
    buyer_ends_with_nocase?: InputMaybe<Scalars['String']>
    buyer_gt?: InputMaybe<Scalars['String']>
    buyer_gte?: InputMaybe<Scalars['String']>
    buyer_in?: InputMaybe<Array<Scalars['String']>>
    buyer_lt?: InputMaybe<Scalars['String']>
    buyer_lte?: InputMaybe<Scalars['String']>
    buyer_not?: InputMaybe<Scalars['String']>
    buyer_not_contains?: InputMaybe<Scalars['String']>
    buyer_not_contains_nocase?: InputMaybe<Scalars['String']>
    buyer_not_ends_with?: InputMaybe<Scalars['String']>
    buyer_not_ends_with_nocase?: InputMaybe<Scalars['String']>
    buyer_not_in?: InputMaybe<Array<Scalars['String']>>
    buyer_not_starts_with?: InputMaybe<Scalars['String']>
    buyer_not_starts_with_nocase?: InputMaybe<Scalars['String']>
    buyer_starts_with?: InputMaybe<Scalars['String']>
    buyer_starts_with_nocase?: InputMaybe<Scalars['String']>
    collection?: InputMaybe<Scalars['String']>
    collectionName?: InputMaybe<Scalars['String']>
    collectionName_contains?: InputMaybe<Scalars['String']>
    collectionName_contains_nocase?: InputMaybe<Scalars['String']>
    collectionName_ends_with?: InputMaybe<Scalars['String']>
    collectionName_ends_with_nocase?: InputMaybe<Scalars['String']>
    collectionName_gt?: InputMaybe<Scalars['String']>
    collectionName_gte?: InputMaybe<Scalars['String']>
    collectionName_in?: InputMaybe<Array<Scalars['String']>>
    collectionName_lt?: InputMaybe<Scalars['String']>
    collectionName_lte?: InputMaybe<Scalars['String']>
    collectionName_not?: InputMaybe<Scalars['String']>
    collectionName_not_contains?: InputMaybe<Scalars['String']>
    collectionName_not_contains_nocase?: InputMaybe<Scalars['String']>
    collectionName_not_ends_with?: InputMaybe<Scalars['String']>
    collectionName_not_ends_with_nocase?: InputMaybe<Scalars['String']>
    collectionName_not_in?: InputMaybe<Array<Scalars['String']>>
    collectionName_not_starts_with?: InputMaybe<Scalars['String']>
    collectionName_not_starts_with_nocase?: InputMaybe<Scalars['String']>
    collectionName_starts_with?: InputMaybe<Scalars['String']>
    collectionName_starts_with_nocase?: InputMaybe<Scalars['String']>
    collection_contains?: InputMaybe<Scalars['String']>
    collection_contains_nocase?: InputMaybe<Scalars['String']>
    collection_ends_with?: InputMaybe<Scalars['String']>
    collection_ends_with_nocase?: InputMaybe<Scalars['String']>
    collection_gt?: InputMaybe<Scalars['String']>
    collection_gte?: InputMaybe<Scalars['String']>
    collection_in?: InputMaybe<Array<Scalars['String']>>
    collection_lt?: InputMaybe<Scalars['String']>
    collection_lte?: InputMaybe<Scalars['String']>
    collection_not?: InputMaybe<Scalars['String']>
    collection_not_contains?: InputMaybe<Scalars['String']>
    collection_not_contains_nocase?: InputMaybe<Scalars['String']>
    collection_not_ends_with?: InputMaybe<Scalars['String']>
    collection_not_ends_with_nocase?: InputMaybe<Scalars['String']>
    collection_not_in?: InputMaybe<Array<Scalars['String']>>
    collection_not_starts_with?: InputMaybe<Scalars['String']>
    collection_not_starts_with_nocase?: InputMaybe<Scalars['String']>
    collection_starts_with?: InputMaybe<Scalars['String']>
    collection_starts_with_nocase?: InputMaybe<Scalars['String']>
    expires?: InputMaybe<Scalars['BigInt']>
    expires_gt?: InputMaybe<Scalars['BigInt']>
    expires_gte?: InputMaybe<Scalars['BigInt']>
    expires_in?: InputMaybe<Array<Scalars['BigInt']>>
    expires_lt?: InputMaybe<Scalars['BigInt']>
    expires_lte?: InputMaybe<Scalars['BigInt']>
    expires_not?: InputMaybe<Scalars['BigInt']>
    expires_not_in?: InputMaybe<Array<Scalars['BigInt']>>
    filters?: InputMaybe<Array<Scalars['String']>>
    filters_contains?: InputMaybe<Array<Scalars['String']>>
    filters_contains_nocase?: InputMaybe<Array<Scalars['String']>>
    filters_not?: InputMaybe<Array<Scalars['String']>>
    filters_not_contains?: InputMaybe<Array<Scalars['String']>>
    filters_not_contains_nocase?: InputMaybe<Array<Scalars['String']>>
    id?: InputMaybe<Scalars['ID']>
    id_gt?: InputMaybe<Scalars['ID']>
    id_gte?: InputMaybe<Scalars['ID']>
    id_in?: InputMaybe<Array<Scalars['ID']>>
    id_lt?: InputMaybe<Scalars['ID']>
    id_lte?: InputMaybe<Scalars['ID']>
    id_not?: InputMaybe<Scalars['ID']>
    id_not_in?: InputMaybe<Array<Scalars['ID']>>
    nicePrice?: InputMaybe<Scalars['String']>
    nicePrice_contains?: InputMaybe<Scalars['String']>
    nicePrice_contains_nocase?: InputMaybe<Scalars['String']>
    nicePrice_ends_with?: InputMaybe<Scalars['String']>
    nicePrice_ends_with_nocase?: InputMaybe<Scalars['String']>
    nicePrice_gt?: InputMaybe<Scalars['String']>
    nicePrice_gte?: InputMaybe<Scalars['String']>
    nicePrice_in?: InputMaybe<Array<Scalars['String']>>
    nicePrice_lt?: InputMaybe<Scalars['String']>
    nicePrice_lte?: InputMaybe<Scalars['String']>
    nicePrice_not?: InputMaybe<Scalars['String']>
    nicePrice_not_contains?: InputMaybe<Scalars['String']>
    nicePrice_not_contains_nocase?: InputMaybe<Scalars['String']>
    nicePrice_not_ends_with?: InputMaybe<Scalars['String']>
    nicePrice_not_ends_with_nocase?: InputMaybe<Scalars['String']>
    nicePrice_not_in?: InputMaybe<Array<Scalars['String']>>
    nicePrice_not_starts_with?: InputMaybe<Scalars['String']>
    nicePrice_not_starts_with_nocase?: InputMaybe<Scalars['String']>
    nicePrice_starts_with?: InputMaybe<Scalars['String']>
    nicePrice_starts_with_nocase?: InputMaybe<Scalars['String']>
    pricePerItem?: InputMaybe<Scalars['BigInt']>
    pricePerItem_gt?: InputMaybe<Scalars['BigInt']>
    pricePerItem_gte?: InputMaybe<Scalars['BigInt']>
    pricePerItem_in?: InputMaybe<Array<Scalars['BigInt']>>
    pricePerItem_lt?: InputMaybe<Scalars['BigInt']>
    pricePerItem_lte?: InputMaybe<Scalars['BigInt']>
    pricePerItem_not?: InputMaybe<Scalars['BigInt']>
    pricePerItem_not_in?: InputMaybe<Array<Scalars['BigInt']>>
    quantity?: InputMaybe<Scalars['BigInt']>
    quantity_gt?: InputMaybe<Scalars['BigInt']>
    quantity_gte?: InputMaybe<Scalars['BigInt']>
    quantity_in?: InputMaybe<Array<Scalars['BigInt']>>
    quantity_lt?: InputMaybe<Scalars['BigInt']>
    quantity_lte?: InputMaybe<Scalars['BigInt']>
    quantity_not?: InputMaybe<Scalars['BigInt']>
    quantity_not_in?: InputMaybe<Array<Scalars['BigInt']>>
    seller?: InputMaybe<Scalars['String']>
    seller_contains?: InputMaybe<Scalars['String']>
    seller_contains_nocase?: InputMaybe<Scalars['String']>
    seller_ends_with?: InputMaybe<Scalars['String']>
    seller_ends_with_nocase?: InputMaybe<Scalars['String']>
    seller_gt?: InputMaybe<Scalars['String']>
    seller_gte?: InputMaybe<Scalars['String']>
    seller_in?: InputMaybe<Array<Scalars['String']>>
    seller_lt?: InputMaybe<Scalars['String']>
    seller_lte?: InputMaybe<Scalars['String']>
    seller_not?: InputMaybe<Scalars['String']>
    seller_not_contains?: InputMaybe<Scalars['String']>
    seller_not_contains_nocase?: InputMaybe<Scalars['String']>
    seller_not_ends_with?: InputMaybe<Scalars['String']>
    seller_not_ends_with_nocase?: InputMaybe<Scalars['String']>
    seller_not_in?: InputMaybe<Array<Scalars['String']>>
    seller_not_starts_with?: InputMaybe<Scalars['String']>
    seller_not_starts_with_nocase?: InputMaybe<Scalars['String']>
    seller_starts_with?: InputMaybe<Scalars['String']>
    seller_starts_with_nocase?: InputMaybe<Scalars['String']>
    status?: InputMaybe<Status>
    status_in?: InputMaybe<Array<Status>>
    status_not?: InputMaybe<Status>
    status_not_in?: InputMaybe<Array<Status>>
    token?: InputMaybe<Scalars['String']>
    tokenName?: InputMaybe<Scalars['String']>
    tokenName_contains?: InputMaybe<Scalars['String']>
    tokenName_contains_nocase?: InputMaybe<Scalars['String']>
    tokenName_ends_with?: InputMaybe<Scalars['String']>
    tokenName_ends_with_nocase?: InputMaybe<Scalars['String']>
    tokenName_gt?: InputMaybe<Scalars['String']>
    tokenName_gte?: InputMaybe<Scalars['String']>
    tokenName_in?: InputMaybe<Array<Scalars['String']>>
    tokenName_lt?: InputMaybe<Scalars['String']>
    tokenName_lte?: InputMaybe<Scalars['String']>
    tokenName_not?: InputMaybe<Scalars['String']>
    tokenName_not_contains?: InputMaybe<Scalars['String']>
    tokenName_not_contains_nocase?: InputMaybe<Scalars['String']>
    tokenName_not_ends_with?: InputMaybe<Scalars['String']>
    tokenName_not_ends_with_nocase?: InputMaybe<Scalars['String']>
    tokenName_not_in?: InputMaybe<Array<Scalars['String']>>
    tokenName_not_starts_with?: InputMaybe<Scalars['String']>
    tokenName_not_starts_with_nocase?: InputMaybe<Scalars['String']>
    tokenName_starts_with?: InputMaybe<Scalars['String']>
    tokenName_starts_with_nocase?: InputMaybe<Scalars['String']>
    token_contains?: InputMaybe<Scalars['String']>
    token_contains_nocase?: InputMaybe<Scalars['String']>
    token_ends_with?: InputMaybe<Scalars['String']>
    token_ends_with_nocase?: InputMaybe<Scalars['String']>
    token_gt?: InputMaybe<Scalars['String']>
    token_gte?: InputMaybe<Scalars['String']>
    token_in?: InputMaybe<Array<Scalars['String']>>
    token_lt?: InputMaybe<Scalars['String']>
    token_lte?: InputMaybe<Scalars['String']>
    token_not?: InputMaybe<Scalars['String']>
    token_not_contains?: InputMaybe<Scalars['String']>
    token_not_contains_nocase?: InputMaybe<Scalars['String']>
    token_not_ends_with?: InputMaybe<Scalars['String']>
    token_not_ends_with_nocase?: InputMaybe<Scalars['String']>
    token_not_in?: InputMaybe<Array<Scalars['String']>>
    token_not_starts_with?: InputMaybe<Scalars['String']>
    token_not_starts_with_nocase?: InputMaybe<Scalars['String']>
    token_starts_with?: InputMaybe<Scalars['String']>
    token_starts_with_nocase?: InputMaybe<Scalars['String']>
    totalPrice?: InputMaybe<Scalars['String']>
    totalPrice_contains?: InputMaybe<Scalars['String']>
    totalPrice_contains_nocase?: InputMaybe<Scalars['String']>
    totalPrice_ends_with?: InputMaybe<Scalars['String']>
    totalPrice_ends_with_nocase?: InputMaybe<Scalars['String']>
    totalPrice_gt?: InputMaybe<Scalars['String']>
    totalPrice_gte?: InputMaybe<Scalars['String']>
    totalPrice_in?: InputMaybe<Array<Scalars['String']>>
    totalPrice_lt?: InputMaybe<Scalars['String']>
    totalPrice_lte?: InputMaybe<Scalars['String']>
    totalPrice_not?: InputMaybe<Scalars['String']>
    totalPrice_not_contains?: InputMaybe<Scalars['String']>
    totalPrice_not_contains_nocase?: InputMaybe<Scalars['String']>
    totalPrice_not_ends_with?: InputMaybe<Scalars['String']>
    totalPrice_not_ends_with_nocase?: InputMaybe<Scalars['String']>
    totalPrice_not_in?: InputMaybe<Array<Scalars['String']>>
    totalPrice_not_starts_with?: InputMaybe<Scalars['String']>
    totalPrice_not_starts_with_nocase?: InputMaybe<Scalars['String']>
    totalPrice_starts_with?: InputMaybe<Scalars['String']>
    totalPrice_starts_with_nocase?: InputMaybe<Scalars['String']>
    transactionLink?: InputMaybe<Scalars['String']>
    transactionLink_contains?: InputMaybe<Scalars['String']>
    transactionLink_contains_nocase?: InputMaybe<Scalars['String']>
    transactionLink_ends_with?: InputMaybe<Scalars['String']>
    transactionLink_ends_with_nocase?: InputMaybe<Scalars['String']>
    transactionLink_gt?: InputMaybe<Scalars['String']>
    transactionLink_gte?: InputMaybe<Scalars['String']>
    transactionLink_in?: InputMaybe<Array<Scalars['String']>>
    transactionLink_lt?: InputMaybe<Scalars['String']>
    transactionLink_lte?: InputMaybe<Scalars['String']>
    transactionLink_not?: InputMaybe<Scalars['String']>
    transactionLink_not_contains?: InputMaybe<Scalars['String']>
    transactionLink_not_contains_nocase?: InputMaybe<Scalars['String']>
    transactionLink_not_ends_with?: InputMaybe<Scalars['String']>
    transactionLink_not_ends_with_nocase?: InputMaybe<Scalars['String']>
    transactionLink_not_in?: InputMaybe<Array<Scalars['String']>>
    transactionLink_not_starts_with?: InputMaybe<Scalars['String']>
    transactionLink_not_starts_with_nocase?: InputMaybe<Scalars['String']>
    transactionLink_starts_with?: InputMaybe<Scalars['String']>
    transactionLink_starts_with_nocase?: InputMaybe<Scalars['String']>
    user?: InputMaybe<Scalars['String']>
    user_contains?: InputMaybe<Scalars['String']>
    user_contains_nocase?: InputMaybe<Scalars['String']>
    user_ends_with?: InputMaybe<Scalars['String']>
    user_ends_with_nocase?: InputMaybe<Scalars['String']>
    user_gt?: InputMaybe<Scalars['String']>
    user_gte?: InputMaybe<Scalars['String']>
    user_in?: InputMaybe<Array<Scalars['String']>>
    user_lt?: InputMaybe<Scalars['String']>
    user_lte?: InputMaybe<Scalars['String']>
    user_not?: InputMaybe<Scalars['String']>
    user_not_contains?: InputMaybe<Scalars['String']>
    user_not_contains_nocase?: InputMaybe<Scalars['String']>
    user_not_ends_with?: InputMaybe<Scalars['String']>
    user_not_ends_with_nocase?: InputMaybe<Scalars['String']>
    user_not_in?: InputMaybe<Array<Scalars['String']>>
    user_not_starts_with?: InputMaybe<Scalars['String']>
    user_not_starts_with_nocase?: InputMaybe<Scalars['String']>
    user_starts_with?: InputMaybe<Scalars['String']>
    user_starts_with_nocase?: InputMaybe<Scalars['String']>
}

export enum Listing_OrderBy {
    _listedQuantity = '_listedQuantity',
    blockTimestamp = 'blockTimestamp',
    buyer = 'buyer',
    collection = 'collection',
    collectionName = 'collectionName',
    expires = 'expires',
    filters = 'filters',
    id = 'id',
    nicePrice = 'nicePrice',
    pricePerItem = 'pricePerItem',
    quantity = 'quantity',
    seller = 'seller',
    status = 'status',
    token = 'token',
    tokenName = 'tokenName',
    totalPrice = 'totalPrice',
    transactionLink = 'transactionLink',
    user = 'user',
}

export type Metadata = {
    __typename?: 'Metadata'
    attributes?: Maybe<Array<MetadataAttribute>>
    description: Scalars['String']
    id: Scalars['ID']
    image: Scalars['String']
    name: Scalars['String']
    token: Token
}

export type MetadataAttributesArgs = {
    first?: InputMaybe<Scalars['Int']>
    orderBy?: InputMaybe<MetadataAttribute_OrderBy>
    orderDirection?: InputMaybe<OrderDirection>
    skip?: InputMaybe<Scalars['Int']>
    where?: InputMaybe<MetadataAttribute_Filter>
}

export type MetadataAttribute = {
    __typename?: 'MetadataAttribute'
    attribute: Attribute
    id: Scalars['ID']
    metadata: Metadata
}

export type MetadataAttribute_Filter = {
    /** Filter for the block changed event. */
    _change_block?: InputMaybe<BlockChangedFilter>
    attribute?: InputMaybe<Scalars['String']>
    attribute_contains?: InputMaybe<Scalars['String']>
    attribute_contains_nocase?: InputMaybe<Scalars['String']>
    attribute_ends_with?: InputMaybe<Scalars['String']>
    attribute_ends_with_nocase?: InputMaybe<Scalars['String']>
    attribute_gt?: InputMaybe<Scalars['String']>
    attribute_gte?: InputMaybe<Scalars['String']>
    attribute_in?: InputMaybe<Array<Scalars['String']>>
    attribute_lt?: InputMaybe<Scalars['String']>
    attribute_lte?: InputMaybe<Scalars['String']>
    attribute_not?: InputMaybe<Scalars['String']>
    attribute_not_contains?: InputMaybe<Scalars['String']>
    attribute_not_contains_nocase?: InputMaybe<Scalars['String']>
    attribute_not_ends_with?: InputMaybe<Scalars['String']>
    attribute_not_ends_with_nocase?: InputMaybe<Scalars['String']>
    attribute_not_in?: InputMaybe<Array<Scalars['String']>>
    attribute_not_starts_with?: InputMaybe<Scalars['String']>
    attribute_not_starts_with_nocase?: InputMaybe<Scalars['String']>
    attribute_starts_with?: InputMaybe<Scalars['String']>
    attribute_starts_with_nocase?: InputMaybe<Scalars['String']>
    id?: InputMaybe<Scalars['ID']>
    id_gt?: InputMaybe<Scalars['ID']>
    id_gte?: InputMaybe<Scalars['ID']>
    id_in?: InputMaybe<Array<Scalars['ID']>>
    id_lt?: InputMaybe<Scalars['ID']>
    id_lte?: InputMaybe<Scalars['ID']>
    id_not?: InputMaybe<Scalars['ID']>
    id_not_in?: InputMaybe<Array<Scalars['ID']>>
    metadata?: InputMaybe<Scalars['String']>
    metadata_contains?: InputMaybe<Scalars['String']>
    metadata_contains_nocase?: InputMaybe<Scalars['String']>
    metadata_ends_with?: InputMaybe<Scalars['String']>
    metadata_ends_with_nocase?: InputMaybe<Scalars['String']>
    metadata_gt?: InputMaybe<Scalars['String']>
    metadata_gte?: InputMaybe<Scalars['String']>
    metadata_in?: InputMaybe<Array<Scalars['String']>>
    metadata_lt?: InputMaybe<Scalars['String']>
    metadata_lte?: InputMaybe<Scalars['String']>
    metadata_not?: InputMaybe<Scalars['String']>
    metadata_not_contains?: InputMaybe<Scalars['String']>
    metadata_not_contains_nocase?: InputMaybe<Scalars['String']>
    metadata_not_ends_with?: InputMaybe<Scalars['String']>
    metadata_not_ends_with_nocase?: InputMaybe<Scalars['String']>
    metadata_not_in?: InputMaybe<Array<Scalars['String']>>
    metadata_not_starts_with?: InputMaybe<Scalars['String']>
    metadata_not_starts_with_nocase?: InputMaybe<Scalars['String']>
    metadata_starts_with?: InputMaybe<Scalars['String']>
    metadata_starts_with_nocase?: InputMaybe<Scalars['String']>
}

export enum MetadataAttribute_OrderBy {
    attribute = 'attribute',
    id = 'id',
    metadata = 'metadata',
}

export type Metadata_Filter = {
    /** Filter for the block changed event. */
    _change_block?: InputMaybe<BlockChangedFilter>
    description?: InputMaybe<Scalars['String']>
    description_contains?: InputMaybe<Scalars['String']>
    description_contains_nocase?: InputMaybe<Scalars['String']>
    description_ends_with?: InputMaybe<Scalars['String']>
    description_ends_with_nocase?: InputMaybe<Scalars['String']>
    description_gt?: InputMaybe<Scalars['String']>
    description_gte?: InputMaybe<Scalars['String']>
    description_in?: InputMaybe<Array<Scalars['String']>>
    description_lt?: InputMaybe<Scalars['String']>
    description_lte?: InputMaybe<Scalars['String']>
    description_not?: InputMaybe<Scalars['String']>
    description_not_contains?: InputMaybe<Scalars['String']>
    description_not_contains_nocase?: InputMaybe<Scalars['String']>
    description_not_ends_with?: InputMaybe<Scalars['String']>
    description_not_ends_with_nocase?: InputMaybe<Scalars['String']>
    description_not_in?: InputMaybe<Array<Scalars['String']>>
    description_not_starts_with?: InputMaybe<Scalars['String']>
    description_not_starts_with_nocase?: InputMaybe<Scalars['String']>
    description_starts_with?: InputMaybe<Scalars['String']>
    description_starts_with_nocase?: InputMaybe<Scalars['String']>
    id?: InputMaybe<Scalars['ID']>
    id_gt?: InputMaybe<Scalars['ID']>
    id_gte?: InputMaybe<Scalars['ID']>
    id_in?: InputMaybe<Array<Scalars['ID']>>
    id_lt?: InputMaybe<Scalars['ID']>
    id_lte?: InputMaybe<Scalars['ID']>
    id_not?: InputMaybe<Scalars['ID']>
    id_not_in?: InputMaybe<Array<Scalars['ID']>>
    image?: InputMaybe<Scalars['String']>
    image_contains?: InputMaybe<Scalars['String']>
    image_contains_nocase?: InputMaybe<Scalars['String']>
    image_ends_with?: InputMaybe<Scalars['String']>
    image_ends_with_nocase?: InputMaybe<Scalars['String']>
    image_gt?: InputMaybe<Scalars['String']>
    image_gte?: InputMaybe<Scalars['String']>
    image_in?: InputMaybe<Array<Scalars['String']>>
    image_lt?: InputMaybe<Scalars['String']>
    image_lte?: InputMaybe<Scalars['String']>
    image_not?: InputMaybe<Scalars['String']>
    image_not_contains?: InputMaybe<Scalars['String']>
    image_not_contains_nocase?: InputMaybe<Scalars['String']>
    image_not_ends_with?: InputMaybe<Scalars['String']>
    image_not_ends_with_nocase?: InputMaybe<Scalars['String']>
    image_not_in?: InputMaybe<Array<Scalars['String']>>
    image_not_starts_with?: InputMaybe<Scalars['String']>
    image_not_starts_with_nocase?: InputMaybe<Scalars['String']>
    image_starts_with?: InputMaybe<Scalars['String']>
    image_starts_with_nocase?: InputMaybe<Scalars['String']>
    name?: InputMaybe<Scalars['String']>
    name_contains?: InputMaybe<Scalars['String']>
    name_contains_nocase?: InputMaybe<Scalars['String']>
    name_ends_with?: InputMaybe<Scalars['String']>
    name_ends_with_nocase?: InputMaybe<Scalars['String']>
    name_gt?: InputMaybe<Scalars['String']>
    name_gte?: InputMaybe<Scalars['String']>
    name_in?: InputMaybe<Array<Scalars['String']>>
    name_lt?: InputMaybe<Scalars['String']>
    name_lte?: InputMaybe<Scalars['String']>
    name_not?: InputMaybe<Scalars['String']>
    name_not_contains?: InputMaybe<Scalars['String']>
    name_not_contains_nocase?: InputMaybe<Scalars['String']>
    name_not_ends_with?: InputMaybe<Scalars['String']>
    name_not_ends_with_nocase?: InputMaybe<Scalars['String']>
    name_not_in?: InputMaybe<Array<Scalars['String']>>
    name_not_starts_with?: InputMaybe<Scalars['String']>
    name_not_starts_with_nocase?: InputMaybe<Scalars['String']>
    name_starts_with?: InputMaybe<Scalars['String']>
    name_starts_with_nocase?: InputMaybe<Scalars['String']>
    token?: InputMaybe<Scalars['String']>
    token_contains?: InputMaybe<Scalars['String']>
    token_contains_nocase?: InputMaybe<Scalars['String']>
    token_ends_with?: InputMaybe<Scalars['String']>
    token_ends_with_nocase?: InputMaybe<Scalars['String']>
    token_gt?: InputMaybe<Scalars['String']>
    token_gte?: InputMaybe<Scalars['String']>
    token_in?: InputMaybe<Array<Scalars['String']>>
    token_lt?: InputMaybe<Scalars['String']>
    token_lte?: InputMaybe<Scalars['String']>
    token_not?: InputMaybe<Scalars['String']>
    token_not_contains?: InputMaybe<Scalars['String']>
    token_not_contains_nocase?: InputMaybe<Scalars['String']>
    token_not_ends_with?: InputMaybe<Scalars['String']>
    token_not_ends_with_nocase?: InputMaybe<Scalars['String']>
    token_not_in?: InputMaybe<Array<Scalars['String']>>
    token_not_starts_with?: InputMaybe<Scalars['String']>
    token_not_starts_with_nocase?: InputMaybe<Scalars['String']>
    token_starts_with?: InputMaybe<Scalars['String']>
    token_starts_with_nocase?: InputMaybe<Scalars['String']>
}

export enum Metadata_OrderBy {
    attributes = 'attributes',
    description = 'description',
    id = 'id',
    image = 'image',
    name = 'name',
    token = 'token',
}

/** Defines the order direction, either ascending or descending */
export enum OrderDirection {
    asc = 'asc',
    desc = 'desc',
}

export type Query = {
    __typename?: 'Query'
    /** Access to subgraph metadata */
    _meta?: Maybe<_Meta_>
    attribute?: Maybe<Attribute>
    attributes: Array<Attribute>
    collection?: Maybe<Collection>
    collections: Array<Collection>
    creator?: Maybe<Creator>
    creators: Array<Creator>
    exerciser?: Maybe<Exerciser>
    exercisers: Array<Exerciser>
    listing?: Maybe<Listing>
    listings: Array<Listing>
    metadata: Array<Metadata>
    metadataAttribute?: Maybe<MetadataAttribute>
    metadataAttributes: Array<MetadataAttribute>
    student?: Maybe<Student>
    students: Array<Student>
    token?: Maybe<Token>
    tokens: Array<Token>
    user?: Maybe<User>
    userToken?: Maybe<UserToken>
    userTokens: Array<UserToken>
    users: Array<User>
}

export type Query_MetaArgs = {
    block?: InputMaybe<Block_Height>
}

export type QueryAttributeArgs = {
    block?: InputMaybe<Block_Height>
    id: Scalars['ID']
    subgraphError?: _SubgraphErrorPolicy_
}

export type QueryAttributesArgs = {
    block?: InputMaybe<Block_Height>
    first?: InputMaybe<Scalars['Int']>
    orderBy?: InputMaybe<Attribute_OrderBy>
    orderDirection?: InputMaybe<OrderDirection>
    skip?: InputMaybe<Scalars['Int']>
    subgraphError?: _SubgraphErrorPolicy_
    where?: InputMaybe<Attribute_Filter>
}

export type QueryCollectionArgs = {
    block?: InputMaybe<Block_Height>
    id: Scalars['ID']
    subgraphError?: _SubgraphErrorPolicy_
}

export type QueryCollectionsArgs = {
    block?: InputMaybe<Block_Height>
    first?: InputMaybe<Scalars['Int']>
    orderBy?: InputMaybe<Collection_OrderBy>
    orderDirection?: InputMaybe<OrderDirection>
    skip?: InputMaybe<Scalars['Int']>
    subgraphError?: _SubgraphErrorPolicy_
    where?: InputMaybe<Collection_Filter>
}

export type QueryCreatorArgs = {
    block?: InputMaybe<Block_Height>
    id: Scalars['ID']
    subgraphError?: _SubgraphErrorPolicy_
}

export type QueryCreatorsArgs = {
    block?: InputMaybe<Block_Height>
    first?: InputMaybe<Scalars['Int']>
    orderBy?: InputMaybe<Creator_OrderBy>
    orderDirection?: InputMaybe<OrderDirection>
    skip?: InputMaybe<Scalars['Int']>
    subgraphError?: _SubgraphErrorPolicy_
    where?: InputMaybe<Creator_Filter>
}

export type QueryExerciserArgs = {
    block?: InputMaybe<Block_Height>
    id: Scalars['ID']
    subgraphError?: _SubgraphErrorPolicy_
}

export type QueryExercisersArgs = {
    block?: InputMaybe<Block_Height>
    first?: InputMaybe<Scalars['Int']>
    orderBy?: InputMaybe<Exerciser_OrderBy>
    orderDirection?: InputMaybe<OrderDirection>
    skip?: InputMaybe<Scalars['Int']>
    subgraphError?: _SubgraphErrorPolicy_
    where?: InputMaybe<Exerciser_Filter>
}

export type QueryListingArgs = {
    block?: InputMaybe<Block_Height>
    id: Scalars['ID']
    subgraphError?: _SubgraphErrorPolicy_
}

export type QueryListingsArgs = {
    block?: InputMaybe<Block_Height>
    first?: InputMaybe<Scalars['Int']>
    orderBy?: InputMaybe<Listing_OrderBy>
    orderDirection?: InputMaybe<OrderDirection>
    skip?: InputMaybe<Scalars['Int']>
    subgraphError?: _SubgraphErrorPolicy_
    where?: InputMaybe<Listing_Filter>
}

export type QueryMetadataArgs = {
    block?: InputMaybe<Block_Height>
    first?: InputMaybe<Scalars['Int']>
    orderBy?: InputMaybe<Metadata_OrderBy>
    orderDirection?: InputMaybe<OrderDirection>
    skip?: InputMaybe<Scalars['Int']>
    subgraphError?: _SubgraphErrorPolicy_
    where?: InputMaybe<Metadata_Filter>
}

export type QueryMetadataAttributeArgs = {
    block?: InputMaybe<Block_Height>
    id: Scalars['ID']
    subgraphError?: _SubgraphErrorPolicy_
}

export type QueryMetadataAttributesArgs = {
    block?: InputMaybe<Block_Height>
    first?: InputMaybe<Scalars['Int']>
    orderBy?: InputMaybe<MetadataAttribute_OrderBy>
    orderDirection?: InputMaybe<OrderDirection>
    skip?: InputMaybe<Scalars['Int']>
    subgraphError?: _SubgraphErrorPolicy_
    where?: InputMaybe<MetadataAttribute_Filter>
}

export type QueryStudentArgs = {
    block?: InputMaybe<Block_Height>
    id: Scalars['ID']
    subgraphError?: _SubgraphErrorPolicy_
}

export type QueryStudentsArgs = {
    block?: InputMaybe<Block_Height>
    first?: InputMaybe<Scalars['Int']>
    orderBy?: InputMaybe<Student_OrderBy>
    orderDirection?: InputMaybe<OrderDirection>
    skip?: InputMaybe<Scalars['Int']>
    subgraphError?: _SubgraphErrorPolicy_
    where?: InputMaybe<Student_Filter>
}

export type QueryTokenArgs = {
    block?: InputMaybe<Block_Height>
    id: Scalars['ID']
    subgraphError?: _SubgraphErrorPolicy_
}

export type QueryTokensArgs = {
    block?: InputMaybe<Block_Height>
    first?: InputMaybe<Scalars['Int']>
    orderBy?: InputMaybe<Token_OrderBy>
    orderDirection?: InputMaybe<OrderDirection>
    skip?: InputMaybe<Scalars['Int']>
    subgraphError?: _SubgraphErrorPolicy_
    where?: InputMaybe<Token_Filter>
}

export type QueryUserArgs = {
    block?: InputMaybe<Block_Height>
    id: Scalars['ID']
    subgraphError?: _SubgraphErrorPolicy_
}

export type QueryUserTokenArgs = {
    block?: InputMaybe<Block_Height>
    id: Scalars['ID']
    subgraphError?: _SubgraphErrorPolicy_
}

export type QueryUserTokensArgs = {
    block?: InputMaybe<Block_Height>
    first?: InputMaybe<Scalars['Int']>
    orderBy?: InputMaybe<UserToken_OrderBy>
    orderDirection?: InputMaybe<OrderDirection>
    skip?: InputMaybe<Scalars['Int']>
    subgraphError?: _SubgraphErrorPolicy_
    where?: InputMaybe<UserToken_Filter>
}

export type QueryUsersArgs = {
    block?: InputMaybe<Block_Height>
    first?: InputMaybe<Scalars['Int']>
    orderBy?: InputMaybe<User_OrderBy>
    orderDirection?: InputMaybe<OrderDirection>
    skip?: InputMaybe<Scalars['Int']>
    subgraphError?: _SubgraphErrorPolicy_
    where?: InputMaybe<User_Filter>
}

export enum Status {
    Active = 'Active',
    Hidden = 'Hidden',
    Sold = 'Sold',
}

export type Student = {
    __typename?: 'Student'
    id: Scalars['ID']
}

export type Student_Filter = {
    /** Filter for the block changed event. */
    _change_block?: InputMaybe<BlockChangedFilter>
    id?: InputMaybe<Scalars['ID']>
    id_gt?: InputMaybe<Scalars['ID']>
    id_gte?: InputMaybe<Scalars['ID']>
    id_in?: InputMaybe<Array<Scalars['ID']>>
    id_lt?: InputMaybe<Scalars['ID']>
    id_lte?: InputMaybe<Scalars['ID']>
    id_not?: InputMaybe<Scalars['ID']>
    id_not_in?: InputMaybe<Array<Scalars['ID']>>
}

export enum Student_OrderBy {
    id = 'id',
}

export type Subscription = {
    __typename?: 'Subscription'
    /** Access to subgraph metadata */
    _meta?: Maybe<_Meta_>
    attribute?: Maybe<Attribute>
    attributes: Array<Attribute>
    collection?: Maybe<Collection>
    collections: Array<Collection>
    creator?: Maybe<Creator>
    creators: Array<Creator>
    exerciser?: Maybe<Exerciser>
    exercisers: Array<Exerciser>
    listing?: Maybe<Listing>
    listings: Array<Listing>
    metadata: Array<Metadata>
    metadataAttribute?: Maybe<MetadataAttribute>
    metadataAttributes: Array<MetadataAttribute>
    student?: Maybe<Student>
    students: Array<Student>
    token?: Maybe<Token>
    tokens: Array<Token>
    user?: Maybe<User>
    userToken?: Maybe<UserToken>
    userTokens: Array<UserToken>
    users: Array<User>
}

export type Subscription_MetaArgs = {
    block?: InputMaybe<Block_Height>
}

export type SubscriptionAttributeArgs = {
    block?: InputMaybe<Block_Height>
    id: Scalars['ID']
    subgraphError?: _SubgraphErrorPolicy_
}

export type SubscriptionAttributesArgs = {
    block?: InputMaybe<Block_Height>
    first?: InputMaybe<Scalars['Int']>
    orderBy?: InputMaybe<Attribute_OrderBy>
    orderDirection?: InputMaybe<OrderDirection>
    skip?: InputMaybe<Scalars['Int']>
    subgraphError?: _SubgraphErrorPolicy_
    where?: InputMaybe<Attribute_Filter>
}

export type SubscriptionCollectionArgs = {
    block?: InputMaybe<Block_Height>
    id: Scalars['ID']
    subgraphError?: _SubgraphErrorPolicy_
}

export type SubscriptionCollectionsArgs = {
    block?: InputMaybe<Block_Height>
    first?: InputMaybe<Scalars['Int']>
    orderBy?: InputMaybe<Collection_OrderBy>
    orderDirection?: InputMaybe<OrderDirection>
    skip?: InputMaybe<Scalars['Int']>
    subgraphError?: _SubgraphErrorPolicy_
    where?: InputMaybe<Collection_Filter>
}

export type SubscriptionCreatorArgs = {
    block?: InputMaybe<Block_Height>
    id: Scalars['ID']
    subgraphError?: _SubgraphErrorPolicy_
}

export type SubscriptionCreatorsArgs = {
    block?: InputMaybe<Block_Height>
    first?: InputMaybe<Scalars['Int']>
    orderBy?: InputMaybe<Creator_OrderBy>
    orderDirection?: InputMaybe<OrderDirection>
    skip?: InputMaybe<Scalars['Int']>
    subgraphError?: _SubgraphErrorPolicy_
    where?: InputMaybe<Creator_Filter>
}

export type SubscriptionExerciserArgs = {
    block?: InputMaybe<Block_Height>
    id: Scalars['ID']
    subgraphError?: _SubgraphErrorPolicy_
}

export type SubscriptionExercisersArgs = {
    block?: InputMaybe<Block_Height>
    first?: InputMaybe<Scalars['Int']>
    orderBy?: InputMaybe<Exerciser_OrderBy>
    orderDirection?: InputMaybe<OrderDirection>
    skip?: InputMaybe<Scalars['Int']>
    subgraphError?: _SubgraphErrorPolicy_
    where?: InputMaybe<Exerciser_Filter>
}

export type SubscriptionListingArgs = {
    block?: InputMaybe<Block_Height>
    id: Scalars['ID']
    subgraphError?: _SubgraphErrorPolicy_
}

export type SubscriptionListingsArgs = {
    block?: InputMaybe<Block_Height>
    first?: InputMaybe<Scalars['Int']>
    orderBy?: InputMaybe<Listing_OrderBy>
    orderDirection?: InputMaybe<OrderDirection>
    skip?: InputMaybe<Scalars['Int']>
    subgraphError?: _SubgraphErrorPolicy_
    where?: InputMaybe<Listing_Filter>
}

export type SubscriptionMetadataArgs = {
    block?: InputMaybe<Block_Height>
    first?: InputMaybe<Scalars['Int']>
    orderBy?: InputMaybe<Metadata_OrderBy>
    orderDirection?: InputMaybe<OrderDirection>
    skip?: InputMaybe<Scalars['Int']>
    subgraphError?: _SubgraphErrorPolicy_
    where?: InputMaybe<Metadata_Filter>
}

export type SubscriptionMetadataAttributeArgs = {
    block?: InputMaybe<Block_Height>
    id: Scalars['ID']
    subgraphError?: _SubgraphErrorPolicy_
}

export type SubscriptionMetadataAttributesArgs = {
    block?: InputMaybe<Block_Height>
    first?: InputMaybe<Scalars['Int']>
    orderBy?: InputMaybe<MetadataAttribute_OrderBy>
    orderDirection?: InputMaybe<OrderDirection>
    skip?: InputMaybe<Scalars['Int']>
    subgraphError?: _SubgraphErrorPolicy_
    where?: InputMaybe<MetadataAttribute_Filter>
}

export type SubscriptionStudentArgs = {
    block?: InputMaybe<Block_Height>
    id: Scalars['ID']
    subgraphError?: _SubgraphErrorPolicy_
}

export type SubscriptionStudentsArgs = {
    block?: InputMaybe<Block_Height>
    first?: InputMaybe<Scalars['Int']>
    orderBy?: InputMaybe<Student_OrderBy>
    orderDirection?: InputMaybe<OrderDirection>
    skip?: InputMaybe<Scalars['Int']>
    subgraphError?: _SubgraphErrorPolicy_
    where?: InputMaybe<Student_Filter>
}

export type SubscriptionTokenArgs = {
    block?: InputMaybe<Block_Height>
    id: Scalars['ID']
    subgraphError?: _SubgraphErrorPolicy_
}

export type SubscriptionTokensArgs = {
    block?: InputMaybe<Block_Height>
    first?: InputMaybe<Scalars['Int']>
    orderBy?: InputMaybe<Token_OrderBy>
    orderDirection?: InputMaybe<OrderDirection>
    skip?: InputMaybe<Scalars['Int']>
    subgraphError?: _SubgraphErrorPolicy_
    where?: InputMaybe<Token_Filter>
}

export type SubscriptionUserArgs = {
    block?: InputMaybe<Block_Height>
    id: Scalars['ID']
    subgraphError?: _SubgraphErrorPolicy_
}

export type SubscriptionUserTokenArgs = {
    block?: InputMaybe<Block_Height>
    id: Scalars['ID']
    subgraphError?: _SubgraphErrorPolicy_
}

export type SubscriptionUserTokensArgs = {
    block?: InputMaybe<Block_Height>
    first?: InputMaybe<Scalars['Int']>
    orderBy?: InputMaybe<UserToken_OrderBy>
    orderDirection?: InputMaybe<OrderDirection>
    skip?: InputMaybe<Scalars['Int']>
    subgraphError?: _SubgraphErrorPolicy_
    where?: InputMaybe<UserToken_Filter>
}

export type SubscriptionUsersArgs = {
    block?: InputMaybe<Block_Height>
    first?: InputMaybe<Scalars['Int']>
    orderBy?: InputMaybe<User_OrderBy>
    orderDirection?: InputMaybe<OrderDirection>
    skip?: InputMaybe<Scalars['Int']>
    subgraphError?: _SubgraphErrorPolicy_
    where?: InputMaybe<User_Filter>
}

export type Token = {
    __typename?: 'Token'
    /** Internal tracking of owners of token for ERC1155 */
    _owners: Array<Scalars['String']>
    collection: Collection
    /** Used to support multiple filters with metadata attributes */
    filters: Array<Scalars['String']>
    floorPrice?: Maybe<Scalars['BigInt']>
    id: Scalars['ID']
    listings?: Maybe<Array<Listing>>
    metadata?: Maybe<Metadata>
    metadataUri?: Maybe<Scalars['String']>
    name?: Maybe<Scalars['String']>
    /** Owner of token for ERC721, null for ERC1155 */
    owner?: Maybe<User>
    /** Owners of token for ERC1155 */
    owners?: Maybe<Array<UserToken>>
    rank?: Maybe<Scalars['Int']>
    rarity?: Maybe<Scalars['BigDecimal']>
    tokenId: Scalars['BigInt']
    /** This is used for ERC1155s */
    totalItems: Scalars['BigInt']
    /** This is used for ERC1155s */
    totalOwners: Scalars['BigInt']
}

export type TokenListingsArgs = {
    first?: InputMaybe<Scalars['Int']>
    orderBy?: InputMaybe<Listing_OrderBy>
    orderDirection?: InputMaybe<OrderDirection>
    skip?: InputMaybe<Scalars['Int']>
    where?: InputMaybe<Listing_Filter>
}

export type TokenOwnersArgs = {
    first?: InputMaybe<Scalars['Int']>
    orderBy?: InputMaybe<UserToken_OrderBy>
    orderDirection?: InputMaybe<OrderDirection>
    skip?: InputMaybe<Scalars['Int']>
    where?: InputMaybe<UserToken_Filter>
}

export enum TokenStandard {
    ERC721 = 'ERC721',
    ERC1155 = 'ERC1155',
}

export type Token_Filter = {
    /** Filter for the block changed event. */
    _change_block?: InputMaybe<BlockChangedFilter>
    _owners?: InputMaybe<Array<Scalars['String']>>
    _owners_contains?: InputMaybe<Array<Scalars['String']>>
    _owners_contains_nocase?: InputMaybe<Array<Scalars['String']>>
    _owners_not?: InputMaybe<Array<Scalars['String']>>
    _owners_not_contains?: InputMaybe<Array<Scalars['String']>>
    _owners_not_contains_nocase?: InputMaybe<Array<Scalars['String']>>
    collection?: InputMaybe<Scalars['String']>
    collection_contains?: InputMaybe<Scalars['String']>
    collection_contains_nocase?: InputMaybe<Scalars['String']>
    collection_ends_with?: InputMaybe<Scalars['String']>
    collection_ends_with_nocase?: InputMaybe<Scalars['String']>
    collection_gt?: InputMaybe<Scalars['String']>
    collection_gte?: InputMaybe<Scalars['String']>
    collection_in?: InputMaybe<Array<Scalars['String']>>
    collection_lt?: InputMaybe<Scalars['String']>
    collection_lte?: InputMaybe<Scalars['String']>
    collection_not?: InputMaybe<Scalars['String']>
    collection_not_contains?: InputMaybe<Scalars['String']>
    collection_not_contains_nocase?: InputMaybe<Scalars['String']>
    collection_not_ends_with?: InputMaybe<Scalars['String']>
    collection_not_ends_with_nocase?: InputMaybe<Scalars['String']>
    collection_not_in?: InputMaybe<Array<Scalars['String']>>
    collection_not_starts_with?: InputMaybe<Scalars['String']>
    collection_not_starts_with_nocase?: InputMaybe<Scalars['String']>
    collection_starts_with?: InputMaybe<Scalars['String']>
    collection_starts_with_nocase?: InputMaybe<Scalars['String']>
    filters?: InputMaybe<Array<Scalars['String']>>
    filters_contains?: InputMaybe<Array<Scalars['String']>>
    filters_contains_nocase?: InputMaybe<Array<Scalars['String']>>
    filters_not?: InputMaybe<Array<Scalars['String']>>
    filters_not_contains?: InputMaybe<Array<Scalars['String']>>
    filters_not_contains_nocase?: InputMaybe<Array<Scalars['String']>>
    floorPrice?: InputMaybe<Scalars['BigInt']>
    floorPrice_gt?: InputMaybe<Scalars['BigInt']>
    floorPrice_gte?: InputMaybe<Scalars['BigInt']>
    floorPrice_in?: InputMaybe<Array<Scalars['BigInt']>>
    floorPrice_lt?: InputMaybe<Scalars['BigInt']>
    floorPrice_lte?: InputMaybe<Scalars['BigInt']>
    floorPrice_not?: InputMaybe<Scalars['BigInt']>
    floorPrice_not_in?: InputMaybe<Array<Scalars['BigInt']>>
    id?: InputMaybe<Scalars['ID']>
    id_gt?: InputMaybe<Scalars['ID']>
    id_gte?: InputMaybe<Scalars['ID']>
    id_in?: InputMaybe<Array<Scalars['ID']>>
    id_lt?: InputMaybe<Scalars['ID']>
    id_lte?: InputMaybe<Scalars['ID']>
    id_not?: InputMaybe<Scalars['ID']>
    id_not_in?: InputMaybe<Array<Scalars['ID']>>
    metadata?: InputMaybe<Scalars['String']>
    metadataUri?: InputMaybe<Scalars['String']>
    metadataUri_contains?: InputMaybe<Scalars['String']>
    metadataUri_contains_nocase?: InputMaybe<Scalars['String']>
    metadataUri_ends_with?: InputMaybe<Scalars['String']>
    metadataUri_ends_with_nocase?: InputMaybe<Scalars['String']>
    metadataUri_gt?: InputMaybe<Scalars['String']>
    metadataUri_gte?: InputMaybe<Scalars['String']>
    metadataUri_in?: InputMaybe<Array<Scalars['String']>>
    metadataUri_lt?: InputMaybe<Scalars['String']>
    metadataUri_lte?: InputMaybe<Scalars['String']>
    metadataUri_not?: InputMaybe<Scalars['String']>
    metadataUri_not_contains?: InputMaybe<Scalars['String']>
    metadataUri_not_contains_nocase?: InputMaybe<Scalars['String']>
    metadataUri_not_ends_with?: InputMaybe<Scalars['String']>
    metadataUri_not_ends_with_nocase?: InputMaybe<Scalars['String']>
    metadataUri_not_in?: InputMaybe<Array<Scalars['String']>>
    metadataUri_not_starts_with?: InputMaybe<Scalars['String']>
    metadataUri_not_starts_with_nocase?: InputMaybe<Scalars['String']>
    metadataUri_starts_with?: InputMaybe<Scalars['String']>
    metadataUri_starts_with_nocase?: InputMaybe<Scalars['String']>
    metadata_contains?: InputMaybe<Scalars['String']>
    metadata_contains_nocase?: InputMaybe<Scalars['String']>
    metadata_ends_with?: InputMaybe<Scalars['String']>
    metadata_ends_with_nocase?: InputMaybe<Scalars['String']>
    metadata_gt?: InputMaybe<Scalars['String']>
    metadata_gte?: InputMaybe<Scalars['String']>
    metadata_in?: InputMaybe<Array<Scalars['String']>>
    metadata_lt?: InputMaybe<Scalars['String']>
    metadata_lte?: InputMaybe<Scalars['String']>
    metadata_not?: InputMaybe<Scalars['String']>
    metadata_not_contains?: InputMaybe<Scalars['String']>
    metadata_not_contains_nocase?: InputMaybe<Scalars['String']>
    metadata_not_ends_with?: InputMaybe<Scalars['String']>
    metadata_not_ends_with_nocase?: InputMaybe<Scalars['String']>
    metadata_not_in?: InputMaybe<Array<Scalars['String']>>
    metadata_not_starts_with?: InputMaybe<Scalars['String']>
    metadata_not_starts_with_nocase?: InputMaybe<Scalars['String']>
    metadata_starts_with?: InputMaybe<Scalars['String']>
    metadata_starts_with_nocase?: InputMaybe<Scalars['String']>
    name?: InputMaybe<Scalars['String']>
    name_contains?: InputMaybe<Scalars['String']>
    name_contains_nocase?: InputMaybe<Scalars['String']>
    name_ends_with?: InputMaybe<Scalars['String']>
    name_ends_with_nocase?: InputMaybe<Scalars['String']>
    name_gt?: InputMaybe<Scalars['String']>
    name_gte?: InputMaybe<Scalars['String']>
    name_in?: InputMaybe<Array<Scalars['String']>>
    name_lt?: InputMaybe<Scalars['String']>
    name_lte?: InputMaybe<Scalars['String']>
    name_not?: InputMaybe<Scalars['String']>
    name_not_contains?: InputMaybe<Scalars['String']>
    name_not_contains_nocase?: InputMaybe<Scalars['String']>
    name_not_ends_with?: InputMaybe<Scalars['String']>
    name_not_ends_with_nocase?: InputMaybe<Scalars['String']>
    name_not_in?: InputMaybe<Array<Scalars['String']>>
    name_not_starts_with?: InputMaybe<Scalars['String']>
    name_not_starts_with_nocase?: InputMaybe<Scalars['String']>
    name_starts_with?: InputMaybe<Scalars['String']>
    name_starts_with_nocase?: InputMaybe<Scalars['String']>
    owner?: InputMaybe<Scalars['String']>
    owner_contains?: InputMaybe<Scalars['String']>
    owner_contains_nocase?: InputMaybe<Scalars['String']>
    owner_ends_with?: InputMaybe<Scalars['String']>
    owner_ends_with_nocase?: InputMaybe<Scalars['String']>
    owner_gt?: InputMaybe<Scalars['String']>
    owner_gte?: InputMaybe<Scalars['String']>
    owner_in?: InputMaybe<Array<Scalars['String']>>
    owner_lt?: InputMaybe<Scalars['String']>
    owner_lte?: InputMaybe<Scalars['String']>
    owner_not?: InputMaybe<Scalars['String']>
    owner_not_contains?: InputMaybe<Scalars['String']>
    owner_not_contains_nocase?: InputMaybe<Scalars['String']>
    owner_not_ends_with?: InputMaybe<Scalars['String']>
    owner_not_ends_with_nocase?: InputMaybe<Scalars['String']>
    owner_not_in?: InputMaybe<Array<Scalars['String']>>
    owner_not_starts_with?: InputMaybe<Scalars['String']>
    owner_not_starts_with_nocase?: InputMaybe<Scalars['String']>
    owner_starts_with?: InputMaybe<Scalars['String']>
    owner_starts_with_nocase?: InputMaybe<Scalars['String']>
    rank?: InputMaybe<Scalars['Int']>
    rank_gt?: InputMaybe<Scalars['Int']>
    rank_gte?: InputMaybe<Scalars['Int']>
    rank_in?: InputMaybe<Array<Scalars['Int']>>
    rank_lt?: InputMaybe<Scalars['Int']>
    rank_lte?: InputMaybe<Scalars['Int']>
    rank_not?: InputMaybe<Scalars['Int']>
    rank_not_in?: InputMaybe<Array<Scalars['Int']>>
    rarity?: InputMaybe<Scalars['BigDecimal']>
    rarity_gt?: InputMaybe<Scalars['BigDecimal']>
    rarity_gte?: InputMaybe<Scalars['BigDecimal']>
    rarity_in?: InputMaybe<Array<Scalars['BigDecimal']>>
    rarity_lt?: InputMaybe<Scalars['BigDecimal']>
    rarity_lte?: InputMaybe<Scalars['BigDecimal']>
    rarity_not?: InputMaybe<Scalars['BigDecimal']>
    rarity_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>
    tokenId?: InputMaybe<Scalars['BigInt']>
    tokenId_gt?: InputMaybe<Scalars['BigInt']>
    tokenId_gte?: InputMaybe<Scalars['BigInt']>
    tokenId_in?: InputMaybe<Array<Scalars['BigInt']>>
    tokenId_lt?: InputMaybe<Scalars['BigInt']>
    tokenId_lte?: InputMaybe<Scalars['BigInt']>
    tokenId_not?: InputMaybe<Scalars['BigInt']>
    tokenId_not_in?: InputMaybe<Array<Scalars['BigInt']>>
    totalItems?: InputMaybe<Scalars['BigInt']>
    totalItems_gt?: InputMaybe<Scalars['BigInt']>
    totalItems_gte?: InputMaybe<Scalars['BigInt']>
    totalItems_in?: InputMaybe<Array<Scalars['BigInt']>>
    totalItems_lt?: InputMaybe<Scalars['BigInt']>
    totalItems_lte?: InputMaybe<Scalars['BigInt']>
    totalItems_not?: InputMaybe<Scalars['BigInt']>
    totalItems_not_in?: InputMaybe<Array<Scalars['BigInt']>>
    totalOwners?: InputMaybe<Scalars['BigInt']>
    totalOwners_gt?: InputMaybe<Scalars['BigInt']>
    totalOwners_gte?: InputMaybe<Scalars['BigInt']>
    totalOwners_in?: InputMaybe<Array<Scalars['BigInt']>>
    totalOwners_lt?: InputMaybe<Scalars['BigInt']>
    totalOwners_lte?: InputMaybe<Scalars['BigInt']>
    totalOwners_not?: InputMaybe<Scalars['BigInt']>
    totalOwners_not_in?: InputMaybe<Array<Scalars['BigInt']>>
}

export enum Token_OrderBy {
    _owners = '_owners',
    collection = 'collection',
    filters = 'filters',
    floorPrice = 'floorPrice',
    id = 'id',
    listings = 'listings',
    metadata = 'metadata',
    metadataUri = 'metadataUri',
    name = 'name',
    owner = 'owner',
    owners = 'owners',
    rank = 'rank',
    rarity = 'rarity',
    tokenId = 'tokenId',
    totalItems = 'totalItems',
    totalOwners = 'totalOwners',
}

export type User = {
    __typename?: 'User'
    id: Scalars['ID']
    listings: Array<Listing>
    tokens: Array<UserToken>
}

export type UserListingsArgs = {
    first?: InputMaybe<Scalars['Int']>
    orderBy?: InputMaybe<Listing_OrderBy>
    orderDirection?: InputMaybe<OrderDirection>
    skip?: InputMaybe<Scalars['Int']>
    where?: InputMaybe<Listing_Filter>
}

export type UserTokensArgs = {
    first?: InputMaybe<Scalars['Int']>
    orderBy?: InputMaybe<UserToken_OrderBy>
    orderDirection?: InputMaybe<OrderDirection>
    skip?: InputMaybe<Scalars['Int']>
    where?: InputMaybe<UserToken_Filter>
}

export type UserToken = {
    __typename?: 'UserToken'
    id: Scalars['ID']
    quantity: Scalars['BigInt']
    token: Token
    user: User
}

export type UserToken_Filter = {
    /** Filter for the block changed event. */
    _change_block?: InputMaybe<BlockChangedFilter>
    id?: InputMaybe<Scalars['ID']>
    id_gt?: InputMaybe<Scalars['ID']>
    id_gte?: InputMaybe<Scalars['ID']>
    id_in?: InputMaybe<Array<Scalars['ID']>>
    id_lt?: InputMaybe<Scalars['ID']>
    id_lte?: InputMaybe<Scalars['ID']>
    id_not?: InputMaybe<Scalars['ID']>
    id_not_in?: InputMaybe<Array<Scalars['ID']>>
    quantity?: InputMaybe<Scalars['BigInt']>
    quantity_gt?: InputMaybe<Scalars['BigInt']>
    quantity_gte?: InputMaybe<Scalars['BigInt']>
    quantity_in?: InputMaybe<Array<Scalars['BigInt']>>
    quantity_lt?: InputMaybe<Scalars['BigInt']>
    quantity_lte?: InputMaybe<Scalars['BigInt']>
    quantity_not?: InputMaybe<Scalars['BigInt']>
    quantity_not_in?: InputMaybe<Array<Scalars['BigInt']>>
    token?: InputMaybe<Scalars['String']>
    token_contains?: InputMaybe<Scalars['String']>
    token_contains_nocase?: InputMaybe<Scalars['String']>
    token_ends_with?: InputMaybe<Scalars['String']>
    token_ends_with_nocase?: InputMaybe<Scalars['String']>
    token_gt?: InputMaybe<Scalars['String']>
    token_gte?: InputMaybe<Scalars['String']>
    token_in?: InputMaybe<Array<Scalars['String']>>
    token_lt?: InputMaybe<Scalars['String']>
    token_lte?: InputMaybe<Scalars['String']>
    token_not?: InputMaybe<Scalars['String']>
    token_not_contains?: InputMaybe<Scalars['String']>
    token_not_contains_nocase?: InputMaybe<Scalars['String']>
    token_not_ends_with?: InputMaybe<Scalars['String']>
    token_not_ends_with_nocase?: InputMaybe<Scalars['String']>
    token_not_in?: InputMaybe<Array<Scalars['String']>>
    token_not_starts_with?: InputMaybe<Scalars['String']>
    token_not_starts_with_nocase?: InputMaybe<Scalars['String']>
    token_starts_with?: InputMaybe<Scalars['String']>
    token_starts_with_nocase?: InputMaybe<Scalars['String']>
    user?: InputMaybe<Scalars['String']>
    user_contains?: InputMaybe<Scalars['String']>
    user_contains_nocase?: InputMaybe<Scalars['String']>
    user_ends_with?: InputMaybe<Scalars['String']>
    user_ends_with_nocase?: InputMaybe<Scalars['String']>
    user_gt?: InputMaybe<Scalars['String']>
    user_gte?: InputMaybe<Scalars['String']>
    user_in?: InputMaybe<Array<Scalars['String']>>
    user_lt?: InputMaybe<Scalars['String']>
    user_lte?: InputMaybe<Scalars['String']>
    user_not?: InputMaybe<Scalars['String']>
    user_not_contains?: InputMaybe<Scalars['String']>
    user_not_contains_nocase?: InputMaybe<Scalars['String']>
    user_not_ends_with?: InputMaybe<Scalars['String']>
    user_not_ends_with_nocase?: InputMaybe<Scalars['String']>
    user_not_in?: InputMaybe<Array<Scalars['String']>>
    user_not_starts_with?: InputMaybe<Scalars['String']>
    user_not_starts_with_nocase?: InputMaybe<Scalars['String']>
    user_starts_with?: InputMaybe<Scalars['String']>
    user_starts_with_nocase?: InputMaybe<Scalars['String']>
}

export enum UserToken_OrderBy {
    id = 'id',
    quantity = 'quantity',
    token = 'token',
    user = 'user',
}

export type User_Filter = {
    /** Filter for the block changed event. */
    _change_block?: InputMaybe<BlockChangedFilter>
    id?: InputMaybe<Scalars['ID']>
    id_gt?: InputMaybe<Scalars['ID']>
    id_gte?: InputMaybe<Scalars['ID']>
    id_in?: InputMaybe<Array<Scalars['ID']>>
    id_lt?: InputMaybe<Scalars['ID']>
    id_lte?: InputMaybe<Scalars['ID']>
    id_not?: InputMaybe<Scalars['ID']>
    id_not_in?: InputMaybe<Array<Scalars['ID']>>
}

export enum User_OrderBy {
    id = 'id',
    listings = 'listings',
    tokens = 'tokens',
}

export type _Block_ = {
    __typename?: '_Block_'
    /** The hash of the block */
    hash?: Maybe<Scalars['Bytes']>
    /** The block number */
    number: Scalars['Int']
}

/** The type for the top-level _meta field */
export type _Meta_ = {
    __typename?: '_Meta_'
    /**
     * Information about a specific subgraph block. The hash of the block
     * will be null if the _meta field has a block constraint that asks for
     * a block number. It will be filled if the _meta field has no block constraint
     * and therefore asks for the latest  block
     *
     */
    block: _Block_
    /** The deployment ID */
    deployment: Scalars['String']
    /** If `true`, the subgraph encountered indexing errors at some past block */
    hasIndexingErrors: Scalars['Boolean']
}

export enum _SubgraphErrorPolicy_ {
    /** Data will be returned even if the subgraph has indexing errors */
    allow = 'allow',
    /** If the subgraph has indexing errors, data will be omitted. The default. */
    deny = 'deny',
}

export type GetCollectionAttributesQueryVariables = Exact<{
    id: Scalars['ID']
}>

export type GetCollectionAttributesQuery = {
    __typename?: 'Query'
    collection?: {
        __typename?: 'Collection'
        attributes?: Array<{ __typename?: 'Attribute'; name: string; percentage?: string | null; value: string }> | null
    } | null
}

export type GetCollectionMetadataQueryVariables = Exact<{
    ids: Array<Scalars['ID']> | Scalars['ID']
}>

export type GetCollectionMetadataQuery = {
    __typename?: 'Query'
    tokens: Array<{
        __typename?: 'Token'
        name?: string | null
        tokenId: string
        metadata?: { __typename?: 'Metadata'; image: string; name: string; description: string } | null
    }>
}

export type GetTokenMetadataQueryVariables = Exact<{
    id: Scalars['ID']
}>

export type GetTokenMetadataQuery = {
    __typename?: 'Query'
    token?: {
        __typename?: 'Token'
        name?: string | null
        tokenId: string
        metadata?: {
            __typename?: 'Metadata'
            image: string
            name: string
            description: string
            attributes?: Array<{
                __typename?: 'MetadataAttribute'
                attribute: {
                    __typename?: 'Attribute'
                    id: string
                    name: string
                    percentage?: string | null
                    value: string
                }
            }> | null
        } | null
    } | null
}

export type GetFilteredTokensQueryVariables = Exact<{
    attributeIds: Array<Scalars['String']> | Scalars['String']
    tokenIds: Array<Scalars['String']> | Scalars['String']
}>

export type GetFilteredTokensQuery = {
    __typename?: 'Query'
    metadataAttributes: Array<{ __typename?: 'MetadataAttribute'; id: string }>
}

export type GetTokensMetadataQueryVariables = Exact<{
    ids: Array<Scalars['ID']> | Scalars['ID']
}>

export type GetTokensMetadataQuery = {
    __typename?: 'Query'
    tokens: Array<{
        __typename?: 'Token'
        id: string
        name?: string | null
        tokenId: string
        metadata?: { __typename?: 'Metadata'; image: string; name: string; description: string } | null
    }>
}

export const GetCollectionAttributesDocument = gql`
    query getCollectionAttributes($id: ID!) {
        collection(id: $id) {
            attributes {
                name
                percentage
                value
            }
        }
    }
`
export const GetCollectionMetadataDocument = gql`
    query getCollectionMetadata($ids: [ID!]!) {
        tokens(first: 1000, where: { id_in: $ids }) {
            metadata {
                image
                name
                description
            }
            name
            tokenId
        }
    }
`
export const GetTokenMetadataDocument = gql`
    query getTokenMetadata($id: ID!) {
        token(id: $id) {
            metadata {
                attributes {
                    attribute {
                        id
                        name
                        percentage
                        value
                    }
                }
                image
                name
                description
            }
            name
            tokenId
        }
    }
`
export const GetFilteredTokensDocument = gql`
    query getFilteredTokens($attributeIds: [String!]!, $tokenIds: [String!]!) {
        metadataAttributes(where: { attribute_in: $attributeIds, metadata_in: $tokenIds }) {
            id
        }
    }
`
export const GetTokensMetadataDocument = gql`
    query getTokensMetadata($ids: [ID!]!) {
        tokens(first: 1000, where: { collection_not: "0xfe8c1ac365ba6780aec5a985d989b327c27670a1", id_in: $ids }) {
            id
            metadata {
                image
                name
                description
            }
            name
            tokenId
        }
    }
`

export type SdkFunctionWrapper = <T>(
    action: (requestHeaders?: Record<string, string>) => Promise<T>,
    operationName: string,
    operationType?: string,
) => Promise<T>

const defaultWrapper: SdkFunctionWrapper = (action, _operationName, _operationType) => action()

export function getSdk(client: GraphQLClient, withWrapper: SdkFunctionWrapper = defaultWrapper) {
    return {
        getCollectionAttributes(
            variables: GetCollectionAttributesQueryVariables,
            requestHeaders?: Dom.RequestInit['headers'],
        ): Promise<GetCollectionAttributesQuery> {
            return withWrapper(
                (wrappedRequestHeaders) =>
                    client.request<GetCollectionAttributesQuery>(GetCollectionAttributesDocument, variables, {
                        ...requestHeaders,
                        ...wrappedRequestHeaders,
                    }),
                'getCollectionAttributes',
                'query',
            )
        },
        getCollectionMetadata(
            variables: GetCollectionMetadataQueryVariables,
            requestHeaders?: Dom.RequestInit['headers'],
        ): Promise<GetCollectionMetadataQuery> {
            return withWrapper(
                (wrappedRequestHeaders) =>
                    client.request<GetCollectionMetadataQuery>(GetCollectionMetadataDocument, variables, {
                        ...requestHeaders,
                        ...wrappedRequestHeaders,
                    }),
                'getCollectionMetadata',
                'query',
            )
        },
        getTokenMetadata(
            variables: GetTokenMetadataQueryVariables,
            requestHeaders?: Dom.RequestInit['headers'],
        ): Promise<GetTokenMetadataQuery> {
            return withWrapper(
                (wrappedRequestHeaders) =>
                    client.request<GetTokenMetadataQuery>(GetTokenMetadataDocument, variables, {
                        ...requestHeaders,
                        ...wrappedRequestHeaders,
                    }),
                'getTokenMetadata',
                'query',
            )
        },
        getFilteredTokens(
            variables: GetFilteredTokensQueryVariables,
            requestHeaders?: Dom.RequestInit['headers'],
        ): Promise<GetFilteredTokensQuery> {
            return withWrapper(
                (wrappedRequestHeaders) =>
                    client.request<GetFilteredTokensQuery>(GetFilteredTokensDocument, variables, {
                        ...requestHeaders,
                        ...wrappedRequestHeaders,
                    }),
                'getFilteredTokens',
                'query',
            )
        },
        getTokensMetadata(
            variables: GetTokensMetadataQueryVariables,
            requestHeaders?: Dom.RequestInit['headers'],
        ): Promise<GetTokensMetadataQuery> {
            return withWrapper(
                (wrappedRequestHeaders) =>
                    client.request<GetTokensMetadataQuery>(GetTokensMetadataDocument, variables, {
                        ...requestHeaders,
                        ...wrappedRequestHeaders,
                    }),
                'getTokensMetadata',
                'query',
            )
        },
    }
}
export type Sdk = ReturnType<typeof getSdk>
