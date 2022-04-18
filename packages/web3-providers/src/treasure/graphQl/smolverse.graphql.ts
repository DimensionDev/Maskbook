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
    name: Scalars['String']
    percentage?: Maybe<Scalars['BigDecimal']>
    tokens: Array<Token>
    value: Scalars['String']
}

export type AttributeTokensArgs = {
    first?: InputMaybe<Scalars['Int']>
    orderBy?: InputMaybe<Token_OrderBy>
    orderDirection?: InputMaybe<OrderDirection>
    skip?: InputMaybe<Scalars['Int']>
    where?: InputMaybe<Token_Filter>
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
    name = 'name',
    percentage = 'percentage',
    tokens = 'tokens',
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

export type Claim = {
    __typename?: 'Claim'
    id: Scalars['ID']
    rewards: Array<Reward>
    rewardsCount: Scalars['Int']
    startTime: Scalars['BigInt']
    status: ClaimStatus
}

export type ClaimRewardsArgs = {
    first?: InputMaybe<Scalars['Int']>
    orderBy?: InputMaybe<Reward_OrderBy>
    orderDirection?: InputMaybe<OrderDirection>
    skip?: InputMaybe<Scalars['Int']>
    where?: InputMaybe<Reward_Filter>
}

export enum ClaimStatus {
    Claimed = 'Claimed',
    Revealable = 'Revealable',
    Started = 'Started',
}

export type Claim_Filter = {
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
    rewards?: InputMaybe<Array<Scalars['String']>>
    rewardsCount?: InputMaybe<Scalars['Int']>
    rewardsCount_gt?: InputMaybe<Scalars['Int']>
    rewardsCount_gte?: InputMaybe<Scalars['Int']>
    rewardsCount_in?: InputMaybe<Array<Scalars['Int']>>
    rewardsCount_lt?: InputMaybe<Scalars['Int']>
    rewardsCount_lte?: InputMaybe<Scalars['Int']>
    rewardsCount_not?: InputMaybe<Scalars['Int']>
    rewardsCount_not_in?: InputMaybe<Array<Scalars['Int']>>
    rewards_contains?: InputMaybe<Array<Scalars['String']>>
    rewards_contains_nocase?: InputMaybe<Array<Scalars['String']>>
    rewards_not?: InputMaybe<Array<Scalars['String']>>
    rewards_not_contains?: InputMaybe<Array<Scalars['String']>>
    rewards_not_contains_nocase?: InputMaybe<Array<Scalars['String']>>
    startTime?: InputMaybe<Scalars['BigInt']>
    startTime_gt?: InputMaybe<Scalars['BigInt']>
    startTime_gte?: InputMaybe<Scalars['BigInt']>
    startTime_in?: InputMaybe<Array<Scalars['BigInt']>>
    startTime_lt?: InputMaybe<Scalars['BigInt']>
    startTime_lte?: InputMaybe<Scalars['BigInt']>
    startTime_not?: InputMaybe<Scalars['BigInt']>
    startTime_not_in?: InputMaybe<Array<Scalars['BigInt']>>
    status?: InputMaybe<ClaimStatus>
    status_in?: InputMaybe<Array<ClaimStatus>>
    status_not?: InputMaybe<ClaimStatus>
    status_not_in?: InputMaybe<Array<ClaimStatus>>
}

export enum Claim_OrderBy {
    id = 'id',
    rewards = 'rewards',
    rewardsCount = 'rewardsCount',
    startTime = 'startTime',
    status = 'status',
}

export type Collection = {
    __typename?: 'Collection'
    /** Internal for tracking attributes for a collection */
    _attributeIds: Array<Scalars['String']>
    _missingMetadataLastUpdated: Scalars['BigInt']
    /** Internal for tracking token IDs with missing metadata */
    _missingMetadataTokens: Array<Token>
    attributes?: Maybe<Array<Attribute>>
    baseUri?: Maybe<Scalars['String']>
    id: Scalars['ID']
    name: Scalars['String']
    stakedTokensCount: Scalars['Int']
    standard?: Maybe<TokenStandard>
    tokens: Array<Token>
    tokensCount: Scalars['Int']
}

export type Collection_MissingMetadataTokensArgs = {
    first?: InputMaybe<Scalars['Int']>
    orderBy?: InputMaybe<Token_OrderBy>
    orderDirection?: InputMaybe<OrderDirection>
    skip?: InputMaybe<Scalars['Int']>
    where?: InputMaybe<Token_Filter>
}

export type CollectionAttributesArgs = {
    first?: InputMaybe<Scalars['Int']>
    orderBy?: InputMaybe<Attribute_OrderBy>
    orderDirection?: InputMaybe<OrderDirection>
    skip?: InputMaybe<Scalars['Int']>
    where?: InputMaybe<Attribute_Filter>
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
    _missingMetadataLastUpdated?: InputMaybe<Scalars['BigInt']>
    _missingMetadataLastUpdated_gt?: InputMaybe<Scalars['BigInt']>
    _missingMetadataLastUpdated_gte?: InputMaybe<Scalars['BigInt']>
    _missingMetadataLastUpdated_in?: InputMaybe<Array<Scalars['BigInt']>>
    _missingMetadataLastUpdated_lt?: InputMaybe<Scalars['BigInt']>
    _missingMetadataLastUpdated_lte?: InputMaybe<Scalars['BigInt']>
    _missingMetadataLastUpdated_not?: InputMaybe<Scalars['BigInt']>
    _missingMetadataLastUpdated_not_in?: InputMaybe<Array<Scalars['BigInt']>>
    _missingMetadataTokens?: InputMaybe<Array<Scalars['String']>>
    _missingMetadataTokens_contains?: InputMaybe<Array<Scalars['String']>>
    _missingMetadataTokens_contains_nocase?: InputMaybe<Array<Scalars['String']>>
    _missingMetadataTokens_not?: InputMaybe<Array<Scalars['String']>>
    _missingMetadataTokens_not_contains?: InputMaybe<Array<Scalars['String']>>
    _missingMetadataTokens_not_contains_nocase?: InputMaybe<Array<Scalars['String']>>
    baseUri?: InputMaybe<Scalars['String']>
    baseUri_contains?: InputMaybe<Scalars['String']>
    baseUri_contains_nocase?: InputMaybe<Scalars['String']>
    baseUri_ends_with?: InputMaybe<Scalars['String']>
    baseUri_ends_with_nocase?: InputMaybe<Scalars['String']>
    baseUri_gt?: InputMaybe<Scalars['String']>
    baseUri_gte?: InputMaybe<Scalars['String']>
    baseUri_in?: InputMaybe<Array<Scalars['String']>>
    baseUri_lt?: InputMaybe<Scalars['String']>
    baseUri_lte?: InputMaybe<Scalars['String']>
    baseUri_not?: InputMaybe<Scalars['String']>
    baseUri_not_contains?: InputMaybe<Scalars['String']>
    baseUri_not_contains_nocase?: InputMaybe<Scalars['String']>
    baseUri_not_ends_with?: InputMaybe<Scalars['String']>
    baseUri_not_ends_with_nocase?: InputMaybe<Scalars['String']>
    baseUri_not_in?: InputMaybe<Array<Scalars['String']>>
    baseUri_not_starts_with?: InputMaybe<Scalars['String']>
    baseUri_not_starts_with_nocase?: InputMaybe<Scalars['String']>
    baseUri_starts_with?: InputMaybe<Scalars['String']>
    baseUri_starts_with_nocase?: InputMaybe<Scalars['String']>
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
    stakedTokensCount?: InputMaybe<Scalars['Int']>
    stakedTokensCount_gt?: InputMaybe<Scalars['Int']>
    stakedTokensCount_gte?: InputMaybe<Scalars['Int']>
    stakedTokensCount_in?: InputMaybe<Array<Scalars['Int']>>
    stakedTokensCount_lt?: InputMaybe<Scalars['Int']>
    stakedTokensCount_lte?: InputMaybe<Scalars['Int']>
    stakedTokensCount_not?: InputMaybe<Scalars['Int']>
    stakedTokensCount_not_in?: InputMaybe<Array<Scalars['Int']>>
    standard?: InputMaybe<TokenStandard>
    standard_in?: InputMaybe<Array<TokenStandard>>
    standard_not?: InputMaybe<TokenStandard>
    standard_not_in?: InputMaybe<Array<TokenStandard>>
    tokensCount?: InputMaybe<Scalars['Int']>
    tokensCount_gt?: InputMaybe<Scalars['Int']>
    tokensCount_gte?: InputMaybe<Scalars['Int']>
    tokensCount_in?: InputMaybe<Array<Scalars['Int']>>
    tokensCount_lt?: InputMaybe<Scalars['Int']>
    tokensCount_lte?: InputMaybe<Scalars['Int']>
    tokensCount_not?: InputMaybe<Scalars['Int']>
    tokensCount_not_in?: InputMaybe<Array<Scalars['Int']>>
}

export enum Collection_OrderBy {
    _attributeIds = '_attributeIds',
    _missingMetadataLastUpdated = '_missingMetadataLastUpdated',
    _missingMetadataTokens = '_missingMetadataTokens',
    attributes = 'attributes',
    baseUri = 'baseUri',
    id = 'id',
    name = 'name',
    stakedTokensCount = 'stakedTokensCount',
    standard = 'standard',
    tokens = 'tokens',
    tokensCount = 'tokensCount',
}

export enum Location {
    Farm = 'Farm',
    Gym = 'Gym',
    School = 'School',
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
    claim?: Maybe<Claim>
    claims: Array<Claim>
    collection?: Maybe<Collection>
    collections: Array<Collection>
    landMetadata: Array<_LandMetadata>
    random?: Maybe<Random>
    randoms: Array<Random>
    reward?: Maybe<Reward>
    rewards: Array<Reward>
    seeded?: Maybe<Seeded>
    seededs: Array<Seeded>
    stakedToken?: Maybe<StakedToken>
    stakedTokens: Array<StakedToken>
    token?: Maybe<Token>
    tokens: Array<Token>
    user?: Maybe<User>
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

export type QueryClaimArgs = {
    block?: InputMaybe<Block_Height>
    id: Scalars['ID']
    subgraphError?: _SubgraphErrorPolicy_
}

export type QueryClaimsArgs = {
    block?: InputMaybe<Block_Height>
    first?: InputMaybe<Scalars['Int']>
    orderBy?: InputMaybe<Claim_OrderBy>
    orderDirection?: InputMaybe<OrderDirection>
    skip?: InputMaybe<Scalars['Int']>
    subgraphError?: _SubgraphErrorPolicy_
    where?: InputMaybe<Claim_Filter>
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

export type QueryLandMetadataArgs = {
    block?: InputMaybe<Block_Height>
    first?: InputMaybe<Scalars['Int']>
    orderBy?: InputMaybe<_LandMetadata_OrderBy>
    orderDirection?: InputMaybe<OrderDirection>
    skip?: InputMaybe<Scalars['Int']>
    subgraphError?: _SubgraphErrorPolicy_
    where?: InputMaybe<_LandMetadata_Filter>
}

export type QueryRandomArgs = {
    block?: InputMaybe<Block_Height>
    id: Scalars['ID']
    subgraphError?: _SubgraphErrorPolicy_
}

export type QueryRandomsArgs = {
    block?: InputMaybe<Block_Height>
    first?: InputMaybe<Scalars['Int']>
    orderBy?: InputMaybe<Random_OrderBy>
    orderDirection?: InputMaybe<OrderDirection>
    skip?: InputMaybe<Scalars['Int']>
    subgraphError?: _SubgraphErrorPolicy_
    where?: InputMaybe<Random_Filter>
}

export type QueryRewardArgs = {
    block?: InputMaybe<Block_Height>
    id: Scalars['ID']
    subgraphError?: _SubgraphErrorPolicy_
}

export type QueryRewardsArgs = {
    block?: InputMaybe<Block_Height>
    first?: InputMaybe<Scalars['Int']>
    orderBy?: InputMaybe<Reward_OrderBy>
    orderDirection?: InputMaybe<OrderDirection>
    skip?: InputMaybe<Scalars['Int']>
    subgraphError?: _SubgraphErrorPolicy_
    where?: InputMaybe<Reward_Filter>
}

export type QuerySeededArgs = {
    block?: InputMaybe<Block_Height>
    id: Scalars['ID']
    subgraphError?: _SubgraphErrorPolicy_
}

export type QuerySeededsArgs = {
    block?: InputMaybe<Block_Height>
    first?: InputMaybe<Scalars['Int']>
    orderBy?: InputMaybe<Seeded_OrderBy>
    orderDirection?: InputMaybe<OrderDirection>
    skip?: InputMaybe<Scalars['Int']>
    subgraphError?: _SubgraphErrorPolicy_
    where?: InputMaybe<Seeded_Filter>
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

export type QueryUsersArgs = {
    block?: InputMaybe<Block_Height>
    first?: InputMaybe<Scalars['Int']>
    orderBy?: InputMaybe<User_OrderBy>
    orderDirection?: InputMaybe<OrderDirection>
    skip?: InputMaybe<Scalars['Int']>
    subgraphError?: _SubgraphErrorPolicy_
    where?: InputMaybe<User_Filter>
}

export type Random = {
    __typename?: 'Random'
    /** Internal for tracking associated claim */
    _claimId?: Maybe<Scalars['String']>
    id: Scalars['ID']
}

export type Random_Filter = {
    /** Filter for the block changed event. */
    _change_block?: InputMaybe<BlockChangedFilter>
    _claimId?: InputMaybe<Scalars['String']>
    _claimId_contains?: InputMaybe<Scalars['String']>
    _claimId_contains_nocase?: InputMaybe<Scalars['String']>
    _claimId_ends_with?: InputMaybe<Scalars['String']>
    _claimId_ends_with_nocase?: InputMaybe<Scalars['String']>
    _claimId_gt?: InputMaybe<Scalars['String']>
    _claimId_gte?: InputMaybe<Scalars['String']>
    _claimId_in?: InputMaybe<Array<Scalars['String']>>
    _claimId_lt?: InputMaybe<Scalars['String']>
    _claimId_lte?: InputMaybe<Scalars['String']>
    _claimId_not?: InputMaybe<Scalars['String']>
    _claimId_not_contains?: InputMaybe<Scalars['String']>
    _claimId_not_contains_nocase?: InputMaybe<Scalars['String']>
    _claimId_not_ends_with?: InputMaybe<Scalars['String']>
    _claimId_not_ends_with_nocase?: InputMaybe<Scalars['String']>
    _claimId_not_in?: InputMaybe<Array<Scalars['String']>>
    _claimId_not_starts_with?: InputMaybe<Scalars['String']>
    _claimId_not_starts_with_nocase?: InputMaybe<Scalars['String']>
    _claimId_starts_with?: InputMaybe<Scalars['String']>
    _claimId_starts_with_nocase?: InputMaybe<Scalars['String']>
    id?: InputMaybe<Scalars['ID']>
    id_gt?: InputMaybe<Scalars['ID']>
    id_gte?: InputMaybe<Scalars['ID']>
    id_in?: InputMaybe<Array<Scalars['ID']>>
    id_lt?: InputMaybe<Scalars['ID']>
    id_lte?: InputMaybe<Scalars['ID']>
    id_not?: InputMaybe<Scalars['ID']>
    id_not_in?: InputMaybe<Array<Scalars['ID']>>
}

export enum Random_OrderBy {
    _claimId = '_claimId',
    id = 'id',
}

export type Reward = {
    __typename?: 'Reward'
    id: Scalars['ID']
    token: Token
}

export type Reward_Filter = {
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

export enum Reward_OrderBy {
    id = 'id',
    token = 'token',
}

export type Seeded = {
    __typename?: 'Seeded'
    /** Internal for tracking associated random requests */
    _randomIds: Array<Scalars['String']>
    id: Scalars['ID']
}

export type Seeded_Filter = {
    /** Filter for the block changed event. */
    _change_block?: InputMaybe<BlockChangedFilter>
    _randomIds?: InputMaybe<Array<Scalars['String']>>
    _randomIds_contains?: InputMaybe<Array<Scalars['String']>>
    _randomIds_contains_nocase?: InputMaybe<Array<Scalars['String']>>
    _randomIds_not?: InputMaybe<Array<Scalars['String']>>
    _randomIds_not_contains?: InputMaybe<Array<Scalars['String']>>
    _randomIds_not_contains_nocase?: InputMaybe<Array<Scalars['String']>>
    id?: InputMaybe<Scalars['ID']>
    id_gt?: InputMaybe<Scalars['ID']>
    id_gte?: InputMaybe<Scalars['ID']>
    id_in?: InputMaybe<Array<Scalars['ID']>>
    id_lt?: InputMaybe<Scalars['ID']>
    id_lte?: InputMaybe<Scalars['ID']>
    id_not?: InputMaybe<Scalars['ID']>
    id_not_in?: InputMaybe<Array<Scalars['ID']>>
}

export enum Seeded_OrderBy {
    _randomIds = '_randomIds',
    id = 'id',
}

export type StakedToken = {
    __typename?: 'StakedToken'
    /** Internal for tracking pending claims */
    _pendingClaimId?: Maybe<Scalars['String']>
    claims?: Maybe<Array<Claim>>
    id: Scalars['ID']
    location: Location
    owner: User
    stakeTime?: Maybe<Scalars['BigInt']>
    token: Token
}

export type StakedTokenClaimsArgs = {
    first?: InputMaybe<Scalars['Int']>
    orderBy?: InputMaybe<Claim_OrderBy>
    orderDirection?: InputMaybe<OrderDirection>
    skip?: InputMaybe<Scalars['Int']>
    where?: InputMaybe<Claim_Filter>
}

export type StakedToken_Filter = {
    /** Filter for the block changed event. */
    _change_block?: InputMaybe<BlockChangedFilter>
    _pendingClaimId?: InputMaybe<Scalars['String']>
    _pendingClaimId_contains?: InputMaybe<Scalars['String']>
    _pendingClaimId_contains_nocase?: InputMaybe<Scalars['String']>
    _pendingClaimId_ends_with?: InputMaybe<Scalars['String']>
    _pendingClaimId_ends_with_nocase?: InputMaybe<Scalars['String']>
    _pendingClaimId_gt?: InputMaybe<Scalars['String']>
    _pendingClaimId_gte?: InputMaybe<Scalars['String']>
    _pendingClaimId_in?: InputMaybe<Array<Scalars['String']>>
    _pendingClaimId_lt?: InputMaybe<Scalars['String']>
    _pendingClaimId_lte?: InputMaybe<Scalars['String']>
    _pendingClaimId_not?: InputMaybe<Scalars['String']>
    _pendingClaimId_not_contains?: InputMaybe<Scalars['String']>
    _pendingClaimId_not_contains_nocase?: InputMaybe<Scalars['String']>
    _pendingClaimId_not_ends_with?: InputMaybe<Scalars['String']>
    _pendingClaimId_not_ends_with_nocase?: InputMaybe<Scalars['String']>
    _pendingClaimId_not_in?: InputMaybe<Array<Scalars['String']>>
    _pendingClaimId_not_starts_with?: InputMaybe<Scalars['String']>
    _pendingClaimId_not_starts_with_nocase?: InputMaybe<Scalars['String']>
    _pendingClaimId_starts_with?: InputMaybe<Scalars['String']>
    _pendingClaimId_starts_with_nocase?: InputMaybe<Scalars['String']>
    claims?: InputMaybe<Array<Scalars['String']>>
    claims_contains?: InputMaybe<Array<Scalars['String']>>
    claims_contains_nocase?: InputMaybe<Array<Scalars['String']>>
    claims_not?: InputMaybe<Array<Scalars['String']>>
    claims_not_contains?: InputMaybe<Array<Scalars['String']>>
    claims_not_contains_nocase?: InputMaybe<Array<Scalars['String']>>
    id?: InputMaybe<Scalars['ID']>
    id_gt?: InputMaybe<Scalars['ID']>
    id_gte?: InputMaybe<Scalars['ID']>
    id_in?: InputMaybe<Array<Scalars['ID']>>
    id_lt?: InputMaybe<Scalars['ID']>
    id_lte?: InputMaybe<Scalars['ID']>
    id_not?: InputMaybe<Scalars['ID']>
    id_not_in?: InputMaybe<Array<Scalars['ID']>>
    location?: InputMaybe<Location>
    location_in?: InputMaybe<Array<Location>>
    location_not?: InputMaybe<Location>
    location_not_in?: InputMaybe<Array<Location>>
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
    stakeTime?: InputMaybe<Scalars['BigInt']>
    stakeTime_gt?: InputMaybe<Scalars['BigInt']>
    stakeTime_gte?: InputMaybe<Scalars['BigInt']>
    stakeTime_in?: InputMaybe<Array<Scalars['BigInt']>>
    stakeTime_lt?: InputMaybe<Scalars['BigInt']>
    stakeTime_lte?: InputMaybe<Scalars['BigInt']>
    stakeTime_not?: InputMaybe<Scalars['BigInt']>
    stakeTime_not_in?: InputMaybe<Array<Scalars['BigInt']>>
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

export enum StakedToken_OrderBy {
    _pendingClaimId = '_pendingClaimId',
    claims = 'claims',
    id = 'id',
    location = 'location',
    owner = 'owner',
    stakeTime = 'stakeTime',
    token = 'token',
}

export type Subscription = {
    __typename?: 'Subscription'
    /** Access to subgraph metadata */
    _meta?: Maybe<_Meta_>
    attribute?: Maybe<Attribute>
    attributes: Array<Attribute>
    claim?: Maybe<Claim>
    claims: Array<Claim>
    collection?: Maybe<Collection>
    collections: Array<Collection>
    landMetadata: Array<_LandMetadata>
    random?: Maybe<Random>
    randoms: Array<Random>
    reward?: Maybe<Reward>
    rewards: Array<Reward>
    seeded?: Maybe<Seeded>
    seededs: Array<Seeded>
    stakedToken?: Maybe<StakedToken>
    stakedTokens: Array<StakedToken>
    token?: Maybe<Token>
    tokens: Array<Token>
    user?: Maybe<User>
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

export type SubscriptionClaimArgs = {
    block?: InputMaybe<Block_Height>
    id: Scalars['ID']
    subgraphError?: _SubgraphErrorPolicy_
}

export type SubscriptionClaimsArgs = {
    block?: InputMaybe<Block_Height>
    first?: InputMaybe<Scalars['Int']>
    orderBy?: InputMaybe<Claim_OrderBy>
    orderDirection?: InputMaybe<OrderDirection>
    skip?: InputMaybe<Scalars['Int']>
    subgraphError?: _SubgraphErrorPolicy_
    where?: InputMaybe<Claim_Filter>
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

export type SubscriptionLandMetadataArgs = {
    block?: InputMaybe<Block_Height>
    first?: InputMaybe<Scalars['Int']>
    orderBy?: InputMaybe<_LandMetadata_OrderBy>
    orderDirection?: InputMaybe<OrderDirection>
    skip?: InputMaybe<Scalars['Int']>
    subgraphError?: _SubgraphErrorPolicy_
    where?: InputMaybe<_LandMetadata_Filter>
}

export type SubscriptionRandomArgs = {
    block?: InputMaybe<Block_Height>
    id: Scalars['ID']
    subgraphError?: _SubgraphErrorPolicy_
}

export type SubscriptionRandomsArgs = {
    block?: InputMaybe<Block_Height>
    first?: InputMaybe<Scalars['Int']>
    orderBy?: InputMaybe<Random_OrderBy>
    orderDirection?: InputMaybe<OrderDirection>
    skip?: InputMaybe<Scalars['Int']>
    subgraphError?: _SubgraphErrorPolicy_
    where?: InputMaybe<Random_Filter>
}

export type SubscriptionRewardArgs = {
    block?: InputMaybe<Block_Height>
    id: Scalars['ID']
    subgraphError?: _SubgraphErrorPolicy_
}

export type SubscriptionRewardsArgs = {
    block?: InputMaybe<Block_Height>
    first?: InputMaybe<Scalars['Int']>
    orderBy?: InputMaybe<Reward_OrderBy>
    orderDirection?: InputMaybe<OrderDirection>
    skip?: InputMaybe<Scalars['Int']>
    subgraphError?: _SubgraphErrorPolicy_
    where?: InputMaybe<Reward_Filter>
}

export type SubscriptionSeededArgs = {
    block?: InputMaybe<Block_Height>
    id: Scalars['ID']
    subgraphError?: _SubgraphErrorPolicy_
}

export type SubscriptionSeededsArgs = {
    block?: InputMaybe<Block_Height>
    first?: InputMaybe<Scalars['Int']>
    orderBy?: InputMaybe<Seeded_OrderBy>
    orderDirection?: InputMaybe<OrderDirection>
    skip?: InputMaybe<Scalars['Int']>
    subgraphError?: _SubgraphErrorPolicy_
    where?: InputMaybe<Seeded_Filter>
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
    attributes: Array<Attribute>
    collection: Collection
    description?: Maybe<Scalars['String']>
    id: Scalars['ID']
    image?: Maybe<Scalars['String']>
    name: Scalars['String']
    owner?: Maybe<User>
    tokenId: Scalars['BigInt']
    video?: Maybe<Scalars['String']>
}

export type TokenAttributesArgs = {
    first?: InputMaybe<Scalars['Int']>
    orderBy?: InputMaybe<Attribute_OrderBy>
    orderDirection?: InputMaybe<OrderDirection>
    skip?: InputMaybe<Scalars['Int']>
    where?: InputMaybe<Attribute_Filter>
}

export enum TokenStandard {
    ERC721 = 'ERC721',
    ERC1155 = 'ERC1155',
}

export type Token_Filter = {
    /** Filter for the block changed event. */
    _change_block?: InputMaybe<BlockChangedFilter>
    attributes?: InputMaybe<Array<Scalars['String']>>
    attributes_contains?: InputMaybe<Array<Scalars['String']>>
    attributes_contains_nocase?: InputMaybe<Array<Scalars['String']>>
    attributes_not?: InputMaybe<Array<Scalars['String']>>
    attributes_not_contains?: InputMaybe<Array<Scalars['String']>>
    attributes_not_contains_nocase?: InputMaybe<Array<Scalars['String']>>
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
    tokenId?: InputMaybe<Scalars['BigInt']>
    tokenId_gt?: InputMaybe<Scalars['BigInt']>
    tokenId_gte?: InputMaybe<Scalars['BigInt']>
    tokenId_in?: InputMaybe<Array<Scalars['BigInt']>>
    tokenId_lt?: InputMaybe<Scalars['BigInt']>
    tokenId_lte?: InputMaybe<Scalars['BigInt']>
    tokenId_not?: InputMaybe<Scalars['BigInt']>
    tokenId_not_in?: InputMaybe<Array<Scalars['BigInt']>>
    video?: InputMaybe<Scalars['String']>
    video_contains?: InputMaybe<Scalars['String']>
    video_contains_nocase?: InputMaybe<Scalars['String']>
    video_ends_with?: InputMaybe<Scalars['String']>
    video_ends_with_nocase?: InputMaybe<Scalars['String']>
    video_gt?: InputMaybe<Scalars['String']>
    video_gte?: InputMaybe<Scalars['String']>
    video_in?: InputMaybe<Array<Scalars['String']>>
    video_lt?: InputMaybe<Scalars['String']>
    video_lte?: InputMaybe<Scalars['String']>
    video_not?: InputMaybe<Scalars['String']>
    video_not_contains?: InputMaybe<Scalars['String']>
    video_not_contains_nocase?: InputMaybe<Scalars['String']>
    video_not_ends_with?: InputMaybe<Scalars['String']>
    video_not_ends_with_nocase?: InputMaybe<Scalars['String']>
    video_not_in?: InputMaybe<Array<Scalars['String']>>
    video_not_starts_with?: InputMaybe<Scalars['String']>
    video_not_starts_with_nocase?: InputMaybe<Scalars['String']>
    video_starts_with?: InputMaybe<Scalars['String']>
    video_starts_with_nocase?: InputMaybe<Scalars['String']>
}

export enum Token_OrderBy {
    attributes = 'attributes',
    collection = 'collection',
    description = 'description',
    id = 'id',
    image = 'image',
    name = 'name',
    owner = 'owner',
    tokenId = 'tokenId',
    video = 'video',
}

export type User = {
    __typename?: 'User'
    id: Scalars['ID']
    stakedTokens: Array<StakedToken>
    tokens: Array<Token>
}

export type UserStakedTokensArgs = {
    first?: InputMaybe<Scalars['Int']>
    orderBy?: InputMaybe<StakedToken_OrderBy>
    orderDirection?: InputMaybe<OrderDirection>
    skip?: InputMaybe<Scalars['Int']>
    where?: InputMaybe<StakedToken_Filter>
}

export type UserTokensArgs = {
    first?: InputMaybe<Scalars['Int']>
    orderBy?: InputMaybe<Token_OrderBy>
    orderDirection?: InputMaybe<OrderDirection>
    skip?: InputMaybe<Scalars['Int']>
    where?: InputMaybe<Token_Filter>
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
    stakedTokens = 'stakedTokens',
    tokens = 'tokens',
}

export type _Block_ = {
    __typename?: '_Block_'
    /** The hash of the block */
    hash?: Maybe<Scalars['Bytes']>
    /** The block number */
    number: Scalars['Int']
}

export type _LandMetadata = {
    __typename?: '_LandMetadata'
    attributes: Array<Attribute>
    description?: Maybe<Scalars['String']>
    id: Scalars['ID']
    image?: Maybe<Scalars['String']>
    name: Scalars['String']
    video?: Maybe<Scalars['String']>
}

export type _LandMetadataAttributesArgs = {
    first?: InputMaybe<Scalars['Int']>
    orderBy?: InputMaybe<Attribute_OrderBy>
    orderDirection?: InputMaybe<OrderDirection>
    skip?: InputMaybe<Scalars['Int']>
    where?: InputMaybe<Attribute_Filter>
}

export type _LandMetadata_Filter = {
    /** Filter for the block changed event. */
    _change_block?: InputMaybe<BlockChangedFilter>
    attributes?: InputMaybe<Array<Scalars['String']>>
    attributes_contains?: InputMaybe<Array<Scalars['String']>>
    attributes_contains_nocase?: InputMaybe<Array<Scalars['String']>>
    attributes_not?: InputMaybe<Array<Scalars['String']>>
    attributes_not_contains?: InputMaybe<Array<Scalars['String']>>
    attributes_not_contains_nocase?: InputMaybe<Array<Scalars['String']>>
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
    video?: InputMaybe<Scalars['String']>
    video_contains?: InputMaybe<Scalars['String']>
    video_contains_nocase?: InputMaybe<Scalars['String']>
    video_ends_with?: InputMaybe<Scalars['String']>
    video_ends_with_nocase?: InputMaybe<Scalars['String']>
    video_gt?: InputMaybe<Scalars['String']>
    video_gte?: InputMaybe<Scalars['String']>
    video_in?: InputMaybe<Array<Scalars['String']>>
    video_lt?: InputMaybe<Scalars['String']>
    video_lte?: InputMaybe<Scalars['String']>
    video_not?: InputMaybe<Scalars['String']>
    video_not_contains?: InputMaybe<Scalars['String']>
    video_not_contains_nocase?: InputMaybe<Scalars['String']>
    video_not_ends_with?: InputMaybe<Scalars['String']>
    video_not_ends_with_nocase?: InputMaybe<Scalars['String']>
    video_not_in?: InputMaybe<Array<Scalars['String']>>
    video_not_starts_with?: InputMaybe<Scalars['String']>
    video_not_starts_with_nocase?: InputMaybe<Scalars['String']>
    video_starts_with?: InputMaybe<Scalars['String']>
    video_starts_with_nocase?: InputMaybe<Scalars['String']>
}

export enum _LandMetadata_OrderBy {
    attributes = 'attributes',
    description = 'description',
    id = 'id',
    image = 'image',
    name = 'name',
    video = 'video',
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

export type GetSmolverseMetadataQueryVariables = Exact<{
    ids: Array<Scalars['ID']> | Scalars['ID']
}>

export type GetSmolverseMetadataQuery = {
    __typename?: 'Query'
    tokens: Array<{
        __typename?: 'Token'
        id: string
        image?: string | null
        name: string
        tokenId: string
        attributes: Array<{ __typename?: 'Attribute'; name: string; percentage?: string | null; value: string }>
    }>
}

export const GetSmolverseMetadataDocument = gql`
    query getSmolverseMetadata($ids: [ID!]!) {
        tokens(first: 1000, where: { id_in: $ids }) {
            id
            attributes {
                name
                percentage
                value
            }
            image
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
        getSmolverseMetadata(
            variables: GetSmolverseMetadataQueryVariables,
            requestHeaders?: Dom.RequestInit['headers'],
        ): Promise<GetSmolverseMetadataQuery> {
            return withWrapper(
                (wrappedRequestHeaders) =>
                    client.request<GetSmolverseMetadataQuery>(GetSmolverseMetadataDocument, variables, {
                        ...requestHeaders,
                        ...wrappedRequestHeaders,
                    }),
                'getSmolverseMetadata',
                'query',
            )
        },
    }
}
export type Sdk = ReturnType<typeof getSdk>
