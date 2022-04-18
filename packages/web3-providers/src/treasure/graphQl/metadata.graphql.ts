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

export type Collection = {
    __typename?: 'Collection'
    /** Internal for tracking attributes for a collection */
    _attributeIds: Array<Scalars['String']>
    /** Internal for tracking attibutes to be calculated */
    _attributePercentageLastUpdated: Scalars['BigInt']
    _missingMetadataLastUpdated: Scalars['BigInt']
    /** Internal for tracking token IDs with missing metadata */
    _missingMetadataTokens: Array<Token>
    attributes: Array<Attribute>
    id: Scalars['ID']
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

export type Collection_Filter = {
    _attributeIds?: InputMaybe<Array<Scalars['String']>>
    _attributeIds_contains?: InputMaybe<Array<Scalars['String']>>
    _attributeIds_contains_nocase?: InputMaybe<Array<Scalars['String']>>
    _attributeIds_not?: InputMaybe<Array<Scalars['String']>>
    _attributeIds_not_contains?: InputMaybe<Array<Scalars['String']>>
    _attributeIds_not_contains_nocase?: InputMaybe<Array<Scalars['String']>>
    _attributePercentageLastUpdated?: InputMaybe<Scalars['BigInt']>
    _attributePercentageLastUpdated_gt?: InputMaybe<Scalars['BigInt']>
    _attributePercentageLastUpdated_gte?: InputMaybe<Scalars['BigInt']>
    _attributePercentageLastUpdated_in?: InputMaybe<Array<Scalars['BigInt']>>
    _attributePercentageLastUpdated_lt?: InputMaybe<Scalars['BigInt']>
    _attributePercentageLastUpdated_lte?: InputMaybe<Scalars['BigInt']>
    _attributePercentageLastUpdated_not?: InputMaybe<Scalars['BigInt']>
    _attributePercentageLastUpdated_not_in?: InputMaybe<Array<Scalars['BigInt']>>
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
    id?: InputMaybe<Scalars['ID']>
    id_gt?: InputMaybe<Scalars['ID']>
    id_gte?: InputMaybe<Scalars['ID']>
    id_in?: InputMaybe<Array<Scalars['ID']>>
    id_lt?: InputMaybe<Scalars['ID']>
    id_lte?: InputMaybe<Scalars['ID']>
    id_not?: InputMaybe<Scalars['ID']>
    id_not_in?: InputMaybe<Array<Scalars['ID']>>
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
    _attributePercentageLastUpdated = '_attributePercentageLastUpdated',
    _missingMetadataLastUpdated = '_missingMetadataLastUpdated',
    _missingMetadataTokens = '_missingMetadataTokens',
    attributes = 'attributes',
    id = 'id',
    tokensCount = 'tokensCount',
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
    token?: Maybe<Token>
    tokens: Array<Token>
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

export type Subscription = {
    __typename?: 'Subscription'
    /** Access to subgraph metadata */
    _meta?: Maybe<_Meta_>
    attribute?: Maybe<Attribute>
    attributes: Array<Attribute>
    collection?: Maybe<Collection>
    collections: Array<Collection>
    token?: Maybe<Token>
    tokens: Array<Token>
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

export type Token = {
    __typename?: 'Token'
    attributes: Array<Attribute>
    description?: Maybe<Scalars['String']>
    id: Scalars['ID']
    image?: Maybe<Scalars['String']>
    name: Scalars['String']
    tokenId: Scalars['BigInt']
}

export type TokenAttributesArgs = {
    first?: InputMaybe<Scalars['Int']>
    orderBy?: InputMaybe<Attribute_OrderBy>
    orderDirection?: InputMaybe<OrderDirection>
    skip?: InputMaybe<Scalars['Int']>
    where?: InputMaybe<Attribute_Filter>
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
    attributes = 'attributes',
    description = 'description',
    id = 'id',
    image = 'image',
    name = 'name',
    tokenId = 'tokenId',
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
    collection: Scalars['String']
}>

export type GetCollectionAttributesQuery = {
    __typename?: 'Query'
    attributes: Array<{ __typename?: 'Attribute'; id: string; name: string; percentage?: string | null; value: string }>
}

export type GetTokenMetadataQueryVariables = Exact<{
    ids: Array<Scalars['ID']> | Scalars['ID']
}>

export type GetTokenMetadataQuery = {
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

export type GetFilteredTokensQueryVariables = Exact<{
    filter: Attribute_Filter
    tokenIds: Array<Scalars['ID']> | Scalars['ID']
}>

export type GetFilteredTokensQuery = {
    __typename?: 'Query'
    attributes: Array<{ __typename?: 'Attribute'; id: string; tokens: Array<{ __typename?: 'Token'; id: string }> }>
}

export const GetCollectionAttributesDocument = gql`
    query getCollectionAttributes($collection: String!) {
        attributes(first: 1000, where: { collection: $collection, name_not_contains: "Max" }) {
            id
            name
            percentage
            value
        }
    }
`
export const GetTokenMetadataDocument = gql`
    query getTokenMetadata($ids: [ID!]!) {
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
export const GetFilteredTokensDocument = gql`
    query getFilteredTokens($filter: Attribute_filter!, $tokenIds: [ID!]!) {
        attributes(where: $filter) {
            id
            tokens(first: 1000, where: { id_in: $tokenIds }) {
                id
            }
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
    }
}
export type Sdk = ReturnType<typeof getSdk>
