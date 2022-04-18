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
    contract: Scalars['String']
    /** Deprecated. Use stats field */
    floorPrice: Scalars['BigInt']
    id: Scalars['ID']
    listings: Array<Listing>
    name: Scalars['String']
    standard: TokenStandard
    stats: StatsData
    tokens: Array<Token>
    /** Deprecated. Use stats field */
    totalListings: Scalars['Int']
    /** Deprecated. Use stats field */
    totalSales: Scalars['BigInt']
    /** Deprecated. Use stats field */
    totalVolume: Scalars['BigInt']
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
    /** Filter for the block changed event. */
    _change_block?: InputMaybe<BlockChangedFilter>
    contract?: InputMaybe<Scalars['String']>
    contract_contains?: InputMaybe<Scalars['String']>
    contract_contains_nocase?: InputMaybe<Scalars['String']>
    contract_ends_with?: InputMaybe<Scalars['String']>
    contract_ends_with_nocase?: InputMaybe<Scalars['String']>
    contract_gt?: InputMaybe<Scalars['String']>
    contract_gte?: InputMaybe<Scalars['String']>
    contract_in?: InputMaybe<Array<Scalars['String']>>
    contract_lt?: InputMaybe<Scalars['String']>
    contract_lte?: InputMaybe<Scalars['String']>
    contract_not?: InputMaybe<Scalars['String']>
    contract_not_contains?: InputMaybe<Scalars['String']>
    contract_not_contains_nocase?: InputMaybe<Scalars['String']>
    contract_not_ends_with?: InputMaybe<Scalars['String']>
    contract_not_ends_with_nocase?: InputMaybe<Scalars['String']>
    contract_not_in?: InputMaybe<Array<Scalars['String']>>
    contract_not_starts_with?: InputMaybe<Scalars['String']>
    contract_not_starts_with_nocase?: InputMaybe<Scalars['String']>
    contract_starts_with?: InputMaybe<Scalars['String']>
    contract_starts_with_nocase?: InputMaybe<Scalars['String']>
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
    listings?: InputMaybe<Array<Scalars['String']>>
    listings_contains?: InputMaybe<Array<Scalars['String']>>
    listings_contains_nocase?: InputMaybe<Array<Scalars['String']>>
    listings_not?: InputMaybe<Array<Scalars['String']>>
    listings_not_contains?: InputMaybe<Array<Scalars['String']>>
    listings_not_contains_nocase?: InputMaybe<Array<Scalars['String']>>
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
    stats?: InputMaybe<Scalars['String']>
    stats_contains?: InputMaybe<Scalars['String']>
    stats_contains_nocase?: InputMaybe<Scalars['String']>
    stats_ends_with?: InputMaybe<Scalars['String']>
    stats_ends_with_nocase?: InputMaybe<Scalars['String']>
    stats_gt?: InputMaybe<Scalars['String']>
    stats_gte?: InputMaybe<Scalars['String']>
    stats_in?: InputMaybe<Array<Scalars['String']>>
    stats_lt?: InputMaybe<Scalars['String']>
    stats_lte?: InputMaybe<Scalars['String']>
    stats_not?: InputMaybe<Scalars['String']>
    stats_not_contains?: InputMaybe<Scalars['String']>
    stats_not_contains_nocase?: InputMaybe<Scalars['String']>
    stats_not_ends_with?: InputMaybe<Scalars['String']>
    stats_not_ends_with_nocase?: InputMaybe<Scalars['String']>
    stats_not_in?: InputMaybe<Array<Scalars['String']>>
    stats_not_starts_with?: InputMaybe<Scalars['String']>
    stats_not_starts_with_nocase?: InputMaybe<Scalars['String']>
    stats_starts_with?: InputMaybe<Scalars['String']>
    stats_starts_with_nocase?: InputMaybe<Scalars['String']>
    totalListings?: InputMaybe<Scalars['Int']>
    totalListings_gt?: InputMaybe<Scalars['Int']>
    totalListings_gte?: InputMaybe<Scalars['Int']>
    totalListings_in?: InputMaybe<Array<Scalars['Int']>>
    totalListings_lt?: InputMaybe<Scalars['Int']>
    totalListings_lte?: InputMaybe<Scalars['Int']>
    totalListings_not?: InputMaybe<Scalars['Int']>
    totalListings_not_in?: InputMaybe<Array<Scalars['Int']>>
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
    contract = 'contract',
    floorPrice = 'floorPrice',
    id = 'id',
    listings = 'listings',
    name = 'name',
    standard = 'standard',
    stats = 'stats',
    tokens = 'tokens',
    totalListings = 'totalListings',
    totalSales = 'totalSales',
    totalVolume = 'totalVolume',
}

export type Listing = {
    __typename?: 'Listing'
    blockTimestamp: Scalars['BigInt']
    buyer?: Maybe<User>
    collection: Collection
    expires: Scalars['BigInt']
    id: Scalars['ID']
    pricePerItem: Scalars['BigInt']
    quantity: Scalars['Int']
    seller: User
    status: Status
    token: Token
    transactionLink?: Maybe<Scalars['String']>
}

export type Listing_Filter = {
    /** Filter for the block changed event. */
    _change_block?: InputMaybe<BlockChangedFilter>
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
    id?: InputMaybe<Scalars['ID']>
    id_gt?: InputMaybe<Scalars['ID']>
    id_gte?: InputMaybe<Scalars['ID']>
    id_in?: InputMaybe<Array<Scalars['ID']>>
    id_lt?: InputMaybe<Scalars['ID']>
    id_lte?: InputMaybe<Scalars['ID']>
    id_not?: InputMaybe<Scalars['ID']>
    id_not_in?: InputMaybe<Array<Scalars['ID']>>
    pricePerItem?: InputMaybe<Scalars['BigInt']>
    pricePerItem_gt?: InputMaybe<Scalars['BigInt']>
    pricePerItem_gte?: InputMaybe<Scalars['BigInt']>
    pricePerItem_in?: InputMaybe<Array<Scalars['BigInt']>>
    pricePerItem_lt?: InputMaybe<Scalars['BigInt']>
    pricePerItem_lte?: InputMaybe<Scalars['BigInt']>
    pricePerItem_not?: InputMaybe<Scalars['BigInt']>
    pricePerItem_not_in?: InputMaybe<Array<Scalars['BigInt']>>
    quantity?: InputMaybe<Scalars['Int']>
    quantity_gt?: InputMaybe<Scalars['Int']>
    quantity_gte?: InputMaybe<Scalars['Int']>
    quantity_in?: InputMaybe<Array<Scalars['Int']>>
    quantity_lt?: InputMaybe<Scalars['Int']>
    quantity_lte?: InputMaybe<Scalars['Int']>
    quantity_not?: InputMaybe<Scalars['Int']>
    quantity_not_in?: InputMaybe<Array<Scalars['Int']>>
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
}

export enum Listing_OrderBy {
    blockTimestamp = 'blockTimestamp',
    buyer = 'buyer',
    collection = 'collection',
    expires = 'expires',
    id = 'id',
    pricePerItem = 'pricePerItem',
    quantity = 'quantity',
    seller = 'seller',
    status = 'status',
    token = 'token',
    transactionLink = 'transactionLink',
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
    collection?: Maybe<Collection>
    collections: Array<Collection>
    listing?: Maybe<Listing>
    listings: Array<Listing>
    stakedToken?: Maybe<StakedToken>
    stakedTokens: Array<StakedToken>
    statsData?: Maybe<StatsData>
    statsDatas: Array<StatsData>
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

export type QueryStakedTokenArgs = {
    block?: InputMaybe<Block_Height>
    id: Scalars['ID']
    subgraphError?: _SubgraphErrorPolicy_
}

export type QueryStakedTokensArgs = {
    block?: InputMaybe<Block_Height>
    first?: InputMaybe<Scalars['Int']>
    orderBy?: InputMaybe<StakedToken_OrderBy>
    orderDirection?: InputMaybe<OrderDirection>
    skip?: InputMaybe<Scalars['Int']>
    subgraphError?: _SubgraphErrorPolicy_
    where?: InputMaybe<StakedToken_Filter>
}

export type QueryStatsDataArgs = {
    block?: InputMaybe<Block_Height>
    id: Scalars['ID']
    subgraphError?: _SubgraphErrorPolicy_
}

export type QueryStatsDatasArgs = {
    block?: InputMaybe<Block_Height>
    first?: InputMaybe<Scalars['Int']>
    orderBy?: InputMaybe<StatsData_OrderBy>
    orderDirection?: InputMaybe<OrderDirection>
    skip?: InputMaybe<Scalars['Int']>
    subgraphError?: _SubgraphErrorPolicy_
    where?: InputMaybe<StatsData_Filter>
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

export type StakedToken = {
    __typename?: 'StakedToken'
    id: Scalars['ID']
    quantity: Scalars['Int']
    token: Token
    user: User
}

export type StakedToken_Filter = {
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
    quantity?: InputMaybe<Scalars['Int']>
    quantity_gt?: InputMaybe<Scalars['Int']>
    quantity_gte?: InputMaybe<Scalars['Int']>
    quantity_in?: InputMaybe<Array<Scalars['Int']>>
    quantity_lt?: InputMaybe<Scalars['Int']>
    quantity_lte?: InputMaybe<Scalars['Int']>
    quantity_not?: InputMaybe<Scalars['Int']>
    quantity_not_in?: InputMaybe<Array<Scalars['Int']>>
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

export enum StakedToken_OrderBy {
    id = 'id',
    quantity = 'quantity',
    token = 'token',
    user = 'user',
}

export type StatsData = {
    __typename?: 'StatsData'
    floorPrice: Scalars['BigInt']
    id: Scalars['ID']
    items: Scalars['Int']
    listings: Scalars['Int']
    sales: Scalars['Int']
    volume: Scalars['BigInt']
}

export type StatsData_Filter = {
    /** Filter for the block changed event. */
    _change_block?: InputMaybe<BlockChangedFilter>
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
    items?: InputMaybe<Scalars['Int']>
    items_gt?: InputMaybe<Scalars['Int']>
    items_gte?: InputMaybe<Scalars['Int']>
    items_in?: InputMaybe<Array<Scalars['Int']>>
    items_lt?: InputMaybe<Scalars['Int']>
    items_lte?: InputMaybe<Scalars['Int']>
    items_not?: InputMaybe<Scalars['Int']>
    items_not_in?: InputMaybe<Array<Scalars['Int']>>
    listings?: InputMaybe<Scalars['Int']>
    listings_gt?: InputMaybe<Scalars['Int']>
    listings_gte?: InputMaybe<Scalars['Int']>
    listings_in?: InputMaybe<Array<Scalars['Int']>>
    listings_lt?: InputMaybe<Scalars['Int']>
    listings_lte?: InputMaybe<Scalars['Int']>
    listings_not?: InputMaybe<Scalars['Int']>
    listings_not_in?: InputMaybe<Array<Scalars['Int']>>
    sales?: InputMaybe<Scalars['Int']>
    sales_gt?: InputMaybe<Scalars['Int']>
    sales_gte?: InputMaybe<Scalars['Int']>
    sales_in?: InputMaybe<Array<Scalars['Int']>>
    sales_lt?: InputMaybe<Scalars['Int']>
    sales_lte?: InputMaybe<Scalars['Int']>
    sales_not?: InputMaybe<Scalars['Int']>
    sales_not_in?: InputMaybe<Array<Scalars['Int']>>
    volume?: InputMaybe<Scalars['BigInt']>
    volume_gt?: InputMaybe<Scalars['BigInt']>
    volume_gte?: InputMaybe<Scalars['BigInt']>
    volume_in?: InputMaybe<Array<Scalars['BigInt']>>
    volume_lt?: InputMaybe<Scalars['BigInt']>
    volume_lte?: InputMaybe<Scalars['BigInt']>
    volume_not?: InputMaybe<Scalars['BigInt']>
    volume_not_in?: InputMaybe<Array<Scalars['BigInt']>>
}

export enum StatsData_OrderBy {
    floorPrice = 'floorPrice',
    id = 'id',
    items = 'items',
    listings = 'listings',
    sales = 'sales',
    volume = 'volume',
}

export enum Status {
    Active = 'Active',
    Expired = 'Expired',
    Inactive = 'Inactive',
    Invalid = 'Invalid',
    Sold = 'Sold',
}

export type Subscription = {
    __typename?: 'Subscription'
    /** Access to subgraph metadata */
    _meta?: Maybe<_Meta_>
    collection?: Maybe<Collection>
    collections: Array<Collection>
    listing?: Maybe<Listing>
    listings: Array<Listing>
    stakedToken?: Maybe<StakedToken>
    stakedTokens: Array<StakedToken>
    statsData?: Maybe<StatsData>
    statsDatas: Array<StatsData>
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

export type SubscriptionStakedTokenArgs = {
    block?: InputMaybe<Block_Height>
    id: Scalars['ID']
    subgraphError?: _SubgraphErrorPolicy_
}

export type SubscriptionStakedTokensArgs = {
    block?: InputMaybe<Block_Height>
    first?: InputMaybe<Scalars['Int']>
    orderBy?: InputMaybe<StakedToken_OrderBy>
    orderDirection?: InputMaybe<OrderDirection>
    skip?: InputMaybe<Scalars['Int']>
    subgraphError?: _SubgraphErrorPolicy_
    where?: InputMaybe<StakedToken_Filter>
}

export type SubscriptionStatsDataArgs = {
    block?: InputMaybe<Block_Height>
    id: Scalars['ID']
    subgraphError?: _SubgraphErrorPolicy_
}

export type SubscriptionStatsDatasArgs = {
    block?: InputMaybe<Block_Height>
    first?: InputMaybe<Scalars['Int']>
    orderBy?: InputMaybe<StatsData_OrderBy>
    orderDirection?: InputMaybe<OrderDirection>
    skip?: InputMaybe<Scalars['Int']>
    subgraphError?: _SubgraphErrorPolicy_
    where?: InputMaybe<StatsData_Filter>
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
    collection: Collection
    /** Deprecated. Use stats field. */
    floorPrice?: Maybe<Scalars['BigInt']>
    id: Scalars['ID']
    listings?: Maybe<Array<Listing>>
    name?: Maybe<Scalars['String']>
    owners: Array<UserToken>
    stats?: Maybe<StatsData>
    tokenId: Scalars['BigInt']
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
    stats?: InputMaybe<Scalars['String']>
    stats_contains?: InputMaybe<Scalars['String']>
    stats_contains_nocase?: InputMaybe<Scalars['String']>
    stats_ends_with?: InputMaybe<Scalars['String']>
    stats_ends_with_nocase?: InputMaybe<Scalars['String']>
    stats_gt?: InputMaybe<Scalars['String']>
    stats_gte?: InputMaybe<Scalars['String']>
    stats_in?: InputMaybe<Array<Scalars['String']>>
    stats_lt?: InputMaybe<Scalars['String']>
    stats_lte?: InputMaybe<Scalars['String']>
    stats_not?: InputMaybe<Scalars['String']>
    stats_not_contains?: InputMaybe<Scalars['String']>
    stats_not_contains_nocase?: InputMaybe<Scalars['String']>
    stats_not_ends_with?: InputMaybe<Scalars['String']>
    stats_not_ends_with_nocase?: InputMaybe<Scalars['String']>
    stats_not_in?: InputMaybe<Array<Scalars['String']>>
    stats_not_starts_with?: InputMaybe<Scalars['String']>
    stats_not_starts_with_nocase?: InputMaybe<Scalars['String']>
    stats_starts_with?: InputMaybe<Scalars['String']>
    stats_starts_with_nocase?: InputMaybe<Scalars['String']>
    tokenId?: InputMaybe<Scalars['BigInt']>
    tokenId_gt?: InputMaybe<Scalars['BigInt']>
    tokenId_gte?: InputMaybe<Scalars['BigInt']>
    tokenId_in?: InputMaybe<Array<Scalars['BigInt']>>
    tokenId_lt?: InputMaybe<Scalars['BigInt']>
    tokenId_lte?: InputMaybe<Scalars['BigInt']>
    tokenId_not?: InputMaybe<Scalars['BigInt']>
    tokenId_not_in?: InputMaybe<Array<Scalars['BigInt']>>
}

export enum Token_OrderBy {
    collection = 'collection',
    floorPrice = 'floorPrice',
    id = 'id',
    listings = 'listings',
    name = 'name',
    owners = 'owners',
    stats = 'stats',
    tokenId = 'tokenId',
}

export type User = {
    __typename?: 'User'
    id: Scalars['ID']
    listings: Array<Listing>
    purchases: Array<Listing>
    staked: Array<StakedToken>
    tokens: Array<UserToken>
}

export type UserListingsArgs = {
    first?: InputMaybe<Scalars['Int']>
    orderBy?: InputMaybe<Listing_OrderBy>
    orderDirection?: InputMaybe<OrderDirection>
    skip?: InputMaybe<Scalars['Int']>
    where?: InputMaybe<Listing_Filter>
}

export type UserPurchasesArgs = {
    first?: InputMaybe<Scalars['Int']>
    orderBy?: InputMaybe<Listing_OrderBy>
    orderDirection?: InputMaybe<OrderDirection>
    skip?: InputMaybe<Scalars['Int']>
    where?: InputMaybe<Listing_Filter>
}

export type UserStakedArgs = {
    first?: InputMaybe<Scalars['Int']>
    orderBy?: InputMaybe<StakedToken_OrderBy>
    orderDirection?: InputMaybe<OrderDirection>
    skip?: InputMaybe<Scalars['Int']>
    where?: InputMaybe<StakedToken_Filter>
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
    quantity: Scalars['Int']
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
    quantity?: InputMaybe<Scalars['Int']>
    quantity_gt?: InputMaybe<Scalars['Int']>
    quantity_gte?: InputMaybe<Scalars['Int']>
    quantity_in?: InputMaybe<Array<Scalars['Int']>>
    quantity_lt?: InputMaybe<Scalars['Int']>
    quantity_lte?: InputMaybe<Scalars['Int']>
    quantity_not?: InputMaybe<Scalars['Int']>
    quantity_not_in?: InputMaybe<Array<Scalars['Int']>>
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
    purchases = 'purchases',
    staked = 'staked',
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

export type GetUserInventoryQueryVariables = Exact<{
    id: Scalars['ID']
}>

export type GetUserInventoryQuery = {
    __typename?: 'Query'
    user?: {
        __typename?: 'User'
        listings: Array<{
            __typename?: 'Listing'
            id: string
            expires: string
            pricePerItem: string
            quantity: number
            token: {
                __typename?: 'Token'
                id: string
                tokenId: string
                collection: {
                    __typename?: 'Collection'
                    id: string
                    contract: string
                    name: string
                    standard: TokenStandard
                }
            }
        }>
        inactive: Array<{
            __typename?: 'Listing'
            id: string
            expires: string
            quantity: number
            pricePerItem: string
            token: {
                __typename?: 'Token'
                id: string
                tokenId: string
                collection: {
                    __typename?: 'Collection'
                    id: string
                    contract: string
                    name: string
                    standard: TokenStandard
                }
            }
        }>
        tokens: Array<{
            __typename?: 'UserToken'
            id: string
            quantity: number
            token: {
                __typename?: 'Token'
                id: string
                tokenId: string
                collection: {
                    __typename?: 'Collection'
                    id: string
                    contract: string
                    name: string
                    standard: TokenStandard
                }
            }
        }>
        staked: Array<{
            __typename?: 'StakedToken'
            id: string
            quantity: number
            token: {
                __typename?: 'Token'
                id: string
                tokenId: string
                collection: {
                    __typename?: 'Collection'
                    id: string
                    contract: string
                    name: string
                    standard: TokenStandard
                }
            }
        }>
    } | null
}

export type TokenFieldsFragment = {
    __typename?: 'Token'
    id: string
    tokenId: string
    collection: { __typename?: 'Collection'; id: string; contract: string; name: string; standard: TokenStandard }
}

export type GetCollectionIdQueryVariables = Exact<{
    name: Scalars['String']
}>

export type GetCollectionIdQuery = {
    __typename?: 'Query'
    collections: Array<{ __typename?: 'Collection'; id: string }>
}

export type GetCollectionStatsQueryVariables = Exact<{
    id: Scalars['ID']
}>

export type GetCollectionStatsQuery = {
    __typename?: 'Query'
    collection?: {
        __typename?: 'Collection'
        standard: TokenStandard
        listings: Array<{
            __typename?: 'Listing'
            token: { __typename?: 'Token'; floorPrice?: string | null; tokenId: string; name?: string | null }
        }>
        stats: { __typename?: 'StatsData'; floorPrice: string; listings: number; items: number; volume: string }
    } | null
}

export type GetCollectionListingsQueryVariables = Exact<{
    erc1155Filters?: InputMaybe<Token_Filter>
    erc1155Ordering?: InputMaybe<Token_OrderBy>
    erc721Filters?: InputMaybe<Listing_Filter>
    erc721Ordering?: InputMaybe<Listing_OrderBy>
    isERC1155: Scalars['Boolean']
    orderDirection?: InputMaybe<OrderDirection>
    skip?: InputMaybe<Scalars['Int']>
}>

export type GetCollectionListingsQuery = {
    __typename?: 'Query'
    tokens?: Array<{
        __typename: 'Token'
        id: string
        tokenId: string
        name?: string | null
        stats?: { __typename?: 'StatsData'; floorPrice: string; listings: number } | null
    }>
    listings?: Array<{
        __typename: 'Listing'
        expires: string
        id: string
        pricePerItem: string
        quantity: number
        seller: { __typename?: 'User'; id: string }
        token: { __typename?: 'Token'; id: string; tokenId: string; name?: string | null }
    }>
}

export type GetTokensByNameQueryVariables = Exact<{
    lower: Scalars['String']
    start: Scalars['String']
    ids: Array<Scalars['ID']> | Scalars['ID']
}>

export type GetTokensByNameQuery = {
    __typename?: 'Query'
    lower: Array<{ __typename?: 'Token'; id: string }>
    start: Array<{ __typename?: 'Token'; id: string }>
}

export type ListingFieldsFragment = {
    __typename?: 'Listing'
    blockTimestamp: string
    id: string
    pricePerItem: string
    quantity: number
    transactionLink?: string | null
    buyer?: { __typename?: 'User'; id: string } | null
    seller: { __typename?: 'User'; id: string }
    token: { __typename?: 'Token'; id: string; tokenId: string }
    collection: { __typename?: 'Collection'; id: string }
}

export type ListingFieldsWithTokenFragment = {
    __typename?: 'Listing'
    expires: string
    id: string
    pricePerItem: string
    quantity: number
    seller: { __typename?: 'User'; id: string }
}

export type GetActivityQueryVariables = Exact<{
    filter: Listing_Filter
    first: Scalars['Int']
    orderBy: Listing_OrderBy
    orderDirection?: InputMaybe<OrderDirection>
}>

export type GetActivityQuery = {
    __typename?: 'Query'
    listings: Array<{
        __typename?: 'Listing'
        blockTimestamp: string
        id: string
        pricePerItem: string
        quantity: number
        transactionLink?: string | null
        buyer?: { __typename?: 'User'; id: string } | null
        seller: { __typename?: 'User'; id: string }
        token: { __typename?: 'Token'; id: string; tokenId: string }
        collection: { __typename?: 'Collection'; id: string }
    }>
}

export type GetErc1155ListingsQueryVariables = Exact<{
    collectionId: Scalars['String']
    tokenId: Scalars['BigInt']
    quantity: Scalars['Int']
    sortBy: Listing_OrderBy
    sortDirection: OrderDirection
    skipBy: Scalars['Int']
    first: Scalars['Int']
}>

export type GetErc1155ListingsQuery = {
    __typename?: 'Query'
    tokens: Array<{
        __typename?: 'Token'
        tokenId: string
        listings?: Array<{
            __typename?: 'Listing'
            expires: string
            id: string
            pricePerItem: string
            quantity: number
            seller: { __typename?: 'User'; id: string }
        }> | null
    }>
}

export type GetTokenExistsInWalletQueryVariables = Exact<{
    collectionId: Scalars['String']
    tokenId: Scalars['BigInt']
    address: Scalars['String']
}>

export type GetTokenExistsInWalletQuery = {
    __typename?: 'Query'
    tokens: Array<{
        __typename?: 'Token'
        owners: Array<{ __typename?: 'UserToken'; quantity: number; user: { __typename?: 'User'; id: string } }>
    }>
}

export type GetCollectionsQueryVariables = Exact<{ [key: string]: never }>

export type GetCollectionsQuery = {
    __typename?: 'Query'
    collections: Array<{ __typename?: 'Collection'; id: string; contract: string; name: string }>
}

export type GetTokenDetailsQueryVariables = Exact<{
    collectionId: Scalars['ID']
    tokenId: Scalars['BigInt']
}>

export type GetTokenDetailsQuery = {
    __typename?: 'Query'
    collection?: {
        __typename?: 'Collection'
        name: string
        standard: TokenStandard
        tokens: Array<{
            __typename?: 'Token'
            id: string
            tokenId: string
            stats?: { __typename?: 'StatsData'; items: number } | null
            lowestPrice?: Array<{
                __typename?: 'Listing'
                expires: string
                id: string
                pricePerItem: string
                quantity: number
                seller: { __typename?: 'User'; id: string }
            }> | null
            listings?: Array<{
                __typename?: 'Listing'
                id: string
                status: Status
                pricePerItem: string
                blockTimestamp: string
                buyer?: { __typename?: 'User'; id: string } | null
                seller: { __typename?: 'User'; id: string }
            }> | null
            owners: Array<{ __typename?: 'UserToken'; user: { __typename?: 'User'; id: string } }>
        }>
    } | null
}

export type GetCollectionsListedTokensQueryVariables = Exact<{
    collection: Scalars['String']
}>

export type GetCollectionsListedTokensQuery = {
    __typename?: 'Query'
    listings: Array<{ __typename?: 'Listing'; token: { __typename?: 'Token'; id: string } }>
}

export type GetFloorPriceQueryVariables = Exact<{
    collection: Scalars['ID']
    tokenId: Scalars['BigInt']
}>

export type GetFloorPriceQuery = {
    __typename?: 'Query'
    collection?: {
        __typename?: 'Collection'
        floorPrice: string
        standard: TokenStandard
        tokens: Array<{ __typename?: 'Token'; floorPrice?: string | null }>
    } | null
}

export type SearchItemsQueryVariables = Exact<{
    lower: Scalars['String']
    start: Scalars['String']
}>

export type SearchItemsQuery = {
    __typename?: 'Query'
    lowerCollections: Array<{ __typename?: 'Collection'; name: string }>
    startCollections: Array<{ __typename?: 'Collection'; name: string }>
    lowerTokens: Array<{
        __typename?: 'Token'
        id: string
        name?: string | null
        tokenId: string
        collection: { __typename?: 'Collection'; name: string }
        listings?: Array<{ __typename?: 'Listing'; pricePerItem: string }> | null
    }>
    startTokens: Array<{
        __typename?: 'Token'
        id: string
        name?: string | null
        tokenId: string
        collection: { __typename?: 'Collection'; name: string }
        listings?: Array<{ __typename?: 'Listing'; pricePerItem: string }> | null
    }>
}

export type TokenSearchFragment = {
    __typename?: 'Token'
    id: string
    name?: string | null
    tokenId: string
    collection: { __typename?: 'Collection'; name: string }
    listings?: Array<{ __typename?: 'Listing'; pricePerItem: string }> | null
}

export const TokenFieldsFragmentDoc = gql`
    fragment TokenFields on Token {
        id
        collection {
            id
            contract
            name
            standard
        }
        tokenId
    }
`
export const ListingFieldsFragmentDoc = gql`
    fragment ListingFields on Listing {
        blockTimestamp
        buyer {
            id
        }
        id
        pricePerItem
        quantity
        seller {
            id
        }
        token {
            id
            tokenId
        }
        collection {
            id
        }
        transactionLink
    }
`
export const ListingFieldsWithTokenFragmentDoc = gql`
    fragment ListingFieldsWithToken on Listing {
        seller {
            id
        }
        expires
        id
        pricePerItem
        quantity
    }
`
export const TokenSearchFragmentDoc = gql`
    fragment TokenSearch on Token {
        collection {
            name
        }
        id
        name
        tokenId
        listings(first: 1, where: { status: Active }, orderBy: pricePerItem, orderDirection: asc) {
            pricePerItem
        }
    }
`
export const GetUserInventoryDocument = gql`
    query getUserInventory($id: ID!) {
        user(id: $id) {
            listings(where: { status_in: [Active, Expired] }) {
                id
                expires
                pricePerItem
                quantity
                token {
                    ...TokenFields
                }
            }
            inactive: listings(where: { status: Inactive }) {
                id
                expires
                quantity
                pricePerItem
                token {
                    ...TokenFields
                }
            }
            tokens(first: 1000) {
                id
                quantity
                token {
                    ...TokenFields
                }
            }
            staked(first: 1000) {
                id
                quantity
                token {
                    ...TokenFields
                }
            }
        }
    }
    ${TokenFieldsFragmentDoc}
`
export const GetCollectionIdDocument = gql`
    query getCollectionId($name: String!) {
        collections(where: { name: $name }) {
            id
        }
    }
`
export const GetCollectionStatsDocument = gql`
    query getCollectionStats($id: ID!) {
        collection(id: $id) {
            listings(where: { status: Active }) {
                token {
                    floorPrice
                    tokenId
                    name
                }
            }
            standard
            stats {
                floorPrice
                listings
                items
                volume
            }
        }
    }
`
export const GetCollectionListingsDocument = gql`
    query getCollectionListings(
        $erc1155Filters: Token_filter
        $erc1155Ordering: Token_orderBy
        $erc721Filters: Listing_filter
        $erc721Ordering: Listing_orderBy
        $isERC1155: Boolean!
        $orderDirection: OrderDirection
        $skip: Int
    ) {
        tokens(first: 200, orderBy: floorPrice, orderDirection: $orderDirection, where: $erc1155Filters)
            @include(if: $isERC1155) {
            __typename
            id
            tokenId
            name
            stats {
                floorPrice
                listings
            }
        }
        listings(
            first: 48
            orderBy: $erc721Ordering
            orderDirection: $orderDirection
            skip: $skip
            where: $erc721Filters
        ) @skip(if: $isERC1155) {
            __typename
            seller {
                id
            }
            expires
            id
            pricePerItem
            token {
                id
                tokenId
                name
            }
            quantity
        }
    }
`
export const GetTokensByNameDocument = gql`
    query getTokensByName($lower: String!, $start: String!, $ids: [ID!]!) {
        lower: tokens(first: 1000, where: { name_contains: $lower, id_in: $ids }) {
            id
        }
        start: tokens(first: 1000, where: { name_contains: $start, id_in: $ids }) {
            id
        }
    }
`
export const GetActivityDocument = gql`
    query getActivity(
        $filter: Listing_filter!
        $first: Int!
        $orderBy: Listing_orderBy!
        $orderDirection: OrderDirection
    ) {
        listings(first: $first, where: $filter, orderBy: $orderBy, orderDirection: desc) {
            ...ListingFields
        }
    }
    ${ListingFieldsFragmentDoc}
`
export const GetErc1155ListingsDocument = gql`
    query getERC1155Listings(
        $collectionId: String!
        $tokenId: BigInt!
        $quantity: Int!
        $sortBy: Listing_orderBy!
        $sortDirection: OrderDirection!
        $skipBy: Int!
        $first: Int!
    ) {
        tokens(where: { collection: $collectionId, tokenId: $tokenId }) {
            tokenId
            listings(
                where: { status: Active, quantity_gte: $quantity }
                skip: $skipBy
                first: $first
                orderBy: $sortBy
                orderDirection: $sortDirection
            ) {
                ...ListingFieldsWithToken
            }
        }
    }
    ${ListingFieldsWithTokenFragmentDoc}
`
export const GetTokenExistsInWalletDocument = gql`
    query getTokenExistsInWallet($collectionId: String!, $tokenId: BigInt!, $address: String!) {
        tokens(where: { collection: $collectionId, tokenId: $tokenId }) {
            owners(where: { user: $address }) {
                user {
                    id
                }
                quantity
            }
        }
    }
`
export const GetCollectionsDocument = gql`
    query getCollections {
        collections(orderBy: name, where: { name_not: "Legions" }) {
            id
            contract
            name
        }
    }
`
export const GetTokenDetailsDocument = gql`
    query getTokenDetails($collectionId: ID!, $tokenId: BigInt!) {
        collection(id: $collectionId) {
            name
            standard
            tokens(where: { tokenId: $tokenId }) {
                id
                tokenId
                stats {
                    items
                }
                lowestPrice: listings(
                    where: { status: Active, quantity_gt: 0 }
                    first: 1
                    orderBy: pricePerItem
                    orderDirection: asc
                ) {
                    ...ListingFieldsWithToken
                }
                listings(orderBy: blockTimestamp, orderDirection: desc) {
                    id
                    status
                    buyer {
                        id
                    }
                    pricePerItem
                    seller {
                        id
                    }
                    blockTimestamp
                }
                owners {
                    user {
                        id
                    }
                }
            }
        }
    }
    ${ListingFieldsWithTokenFragmentDoc}
`
export const GetCollectionsListedTokensDocument = gql`
    query getCollectionsListedTokens($collection: String!) {
        listings(first: 1000, where: { collection: $collection, status: Active, quantity_gt: 0 }, orderBy: id) {
            token {
                id
            }
        }
    }
`
export const GetFloorPriceDocument = gql`
    query getFloorPrice($collection: ID!, $tokenId: BigInt!) {
        collection(id: $collection) {
            floorPrice
            standard
            tokens(where: { tokenId: $tokenId }) {
                floorPrice
            }
        }
    }
`
export const SearchItemsDocument = gql`
    query searchItems($lower: String!, $start: String!) {
        lowerCollections: collections(first: 5, where: { name_contains: $lower }) {
            name
        }
        startCollections: collections(first: 5, where: { name_contains: $start }) {
            name
        }
        lowerTokens: tokens(first: 5, where: { name_contains: $lower }) {
            ...TokenSearch
        }
        startTokens: tokens(first: 5, where: { name_contains: $start }) {
            ...TokenSearch
        }
    }
    ${TokenSearchFragmentDoc}
`

export type SdkFunctionWrapper = <T>(
    action: (requestHeaders?: Record<string, string>) => Promise<T>,
    operationName: string,
    operationType?: string,
) => Promise<T>

const defaultWrapper: SdkFunctionWrapper = (action, _operationName, _operationType) => action()

export function getSdk(client: GraphQLClient, withWrapper: SdkFunctionWrapper = defaultWrapper) {
    return {
        getUserInventory(
            variables: GetUserInventoryQueryVariables,
            requestHeaders?: Dom.RequestInit['headers'],
        ): Promise<GetUserInventoryQuery> {
            return withWrapper(
                (wrappedRequestHeaders) =>
                    client.request<GetUserInventoryQuery>(GetUserInventoryDocument, variables, {
                        ...requestHeaders,
                        ...wrappedRequestHeaders,
                    }),
                'getUserInventory',
                'query',
            )
        },
        getCollectionId(
            variables: GetCollectionIdQueryVariables,
            requestHeaders?: Dom.RequestInit['headers'],
        ): Promise<GetCollectionIdQuery> {
            return withWrapper(
                (wrappedRequestHeaders) =>
                    client.request<GetCollectionIdQuery>(GetCollectionIdDocument, variables, {
                        ...requestHeaders,
                        ...wrappedRequestHeaders,
                    }),
                'getCollectionId',
                'query',
            )
        },
        getCollectionStats(
            variables: GetCollectionStatsQueryVariables,
            requestHeaders?: Dom.RequestInit['headers'],
        ): Promise<GetCollectionStatsQuery> {
            return withWrapper(
                (wrappedRequestHeaders) =>
                    client.request<GetCollectionStatsQuery>(GetCollectionStatsDocument, variables, {
                        ...requestHeaders,
                        ...wrappedRequestHeaders,
                    }),
                'getCollectionStats',
                'query',
            )
        },
        getCollectionListings(
            variables: GetCollectionListingsQueryVariables,
            requestHeaders?: Dom.RequestInit['headers'],
        ): Promise<GetCollectionListingsQuery> {
            return withWrapper(
                (wrappedRequestHeaders) =>
                    client.request<GetCollectionListingsQuery>(GetCollectionListingsDocument, variables, {
                        ...requestHeaders,
                        ...wrappedRequestHeaders,
                    }),
                'getCollectionListings',
                'query',
            )
        },
        getTokensByName(
            variables: GetTokensByNameQueryVariables,
            requestHeaders?: Dom.RequestInit['headers'],
        ): Promise<GetTokensByNameQuery> {
            return withWrapper(
                (wrappedRequestHeaders) =>
                    client.request<GetTokensByNameQuery>(GetTokensByNameDocument, variables, {
                        ...requestHeaders,
                        ...wrappedRequestHeaders,
                    }),
                'getTokensByName',
                'query',
            )
        },
        getActivity(
            variables: GetActivityQueryVariables,
            requestHeaders?: Dom.RequestInit['headers'],
        ): Promise<GetActivityQuery> {
            return withWrapper(
                (wrappedRequestHeaders) =>
                    client.request<GetActivityQuery>(GetActivityDocument, variables, {
                        ...requestHeaders,
                        ...wrappedRequestHeaders,
                    }),
                'getActivity',
                'query',
            )
        },
        getERC1155Listings(
            variables: GetErc1155ListingsQueryVariables,
            requestHeaders?: Dom.RequestInit['headers'],
        ): Promise<GetErc1155ListingsQuery> {
            return withWrapper(
                (wrappedRequestHeaders) =>
                    client.request<GetErc1155ListingsQuery>(GetErc1155ListingsDocument, variables, {
                        ...requestHeaders,
                        ...wrappedRequestHeaders,
                    }),
                'getERC1155Listings',
                'query',
            )
        },
        getTokenExistsInWallet(
            variables: GetTokenExistsInWalletQueryVariables,
            requestHeaders?: Dom.RequestInit['headers'],
        ): Promise<GetTokenExistsInWalletQuery> {
            return withWrapper(
                (wrappedRequestHeaders) =>
                    client.request<GetTokenExistsInWalletQuery>(GetTokenExistsInWalletDocument, variables, {
                        ...requestHeaders,
                        ...wrappedRequestHeaders,
                    }),
                'getTokenExistsInWallet',
                'query',
            )
        },
        getCollections(
            variables?: GetCollectionsQueryVariables,
            requestHeaders?: Dom.RequestInit['headers'],
        ): Promise<GetCollectionsQuery> {
            return withWrapper(
                (wrappedRequestHeaders) =>
                    client.request<GetCollectionsQuery>(GetCollectionsDocument, variables, {
                        ...requestHeaders,
                        ...wrappedRequestHeaders,
                    }),
                'getCollections',
                'query',
            )
        },
        getTokenDetails(
            variables: GetTokenDetailsQueryVariables,
            requestHeaders?: Dom.RequestInit['headers'],
        ): Promise<GetTokenDetailsQuery> {
            return withWrapper(
                (wrappedRequestHeaders) =>
                    client.request<GetTokenDetailsQuery>(GetTokenDetailsDocument, variables, {
                        ...requestHeaders,
                        ...wrappedRequestHeaders,
                    }),
                'getTokenDetails',
                'query',
            )
        },
        getCollectionsListedTokens(
            variables: GetCollectionsListedTokensQueryVariables,
            requestHeaders?: Dom.RequestInit['headers'],
        ): Promise<GetCollectionsListedTokensQuery> {
            return withWrapper(
                (wrappedRequestHeaders) =>
                    client.request<GetCollectionsListedTokensQuery>(GetCollectionsListedTokensDocument, variables, {
                        ...requestHeaders,
                        ...wrappedRequestHeaders,
                    }),
                'getCollectionsListedTokens',
                'query',
            )
        },
        getFloorPrice(
            variables: GetFloorPriceQueryVariables,
            requestHeaders?: Dom.RequestInit['headers'],
        ): Promise<GetFloorPriceQuery> {
            return withWrapper(
                (wrappedRequestHeaders) =>
                    client.request<GetFloorPriceQuery>(GetFloorPriceDocument, variables, {
                        ...requestHeaders,
                        ...wrappedRequestHeaders,
                    }),
                'getFloorPrice',
                'query',
            )
        },
        searchItems(
            variables: SearchItemsQueryVariables,
            requestHeaders?: Dom.RequestInit['headers'],
        ): Promise<SearchItemsQuery> {
            return withWrapper(
                (wrappedRequestHeaders) =>
                    client.request<SearchItemsQuery>(SearchItemsDocument, variables, {
                        ...requestHeaders,
                        ...wrappedRequestHeaders,
                    }),
                'searchItems',
                'query',
            )
        },
    }
}
export type Sdk = ReturnType<typeof getSdk>
