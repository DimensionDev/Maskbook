import { gql } from 'graphql-request'

export const getAssetQuery = gql`
    query getAsset($address: String!, $tokenId: String!) {
        tokens(where: { id: $address, tokenId: $tokenId }) {
            tokenId
            id
            collection {
                name
                contract
                floorPrice
                totalListings
                stats {
                    id
                    floorPrice
                    items
                    listings
                    sales
                    volume
                }
            }
            owners {
                id
            }
        }
    }
`

export const getTokenHistoryQuery = gql`
    query getTokenHistory($address: String!, $tokenId: String!) {
        Token(where: { id: { _eq: $address }, tokenId: { _eq: $tokenId } }) {
            listings{
                id
                blockTimestamp
                buyer {
                    id
                    quantity
                    token
                    user
                }
                collection {
                    id
                    stats{
                        id
                        floorPrice
                        items
                        listings
                        sales
                        volume
                    }
                }

        }
    }
`

export const getCollectionAttributes = gql`
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

export const getCollectionMetadata = gql`
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

export const getTokenMetadata = gql`
    query getTokenMetadata($address: String!) {
        tokens(where: { id: $address }) {
            name
            tokenId
            attributes {
                id
                name
                percentage
                value
            }
            image
            name
            description
        }
    }
`

export const getFilteredTokens = gql`
    query getFilteredTokens($attributeIds: [String!]!, $tokenIds: [String!]!) {
        metadataAttributes(where: { attribute_in: $attributeIds, metadata_in: $tokenIds }) {
            id
        }
    }
`

export const getTokensMetadata = gql`
    query getTokensMetadata($ids: [ID!]!) {
        tokens(first: 1000, where: { collection_not: "0xfe8c1ac365ba6780aec5a985d989b327c27670a1", id_in: $ids }) {
            id
            name
            tokenId
            attributes {
                id
                name
                percentage
                value
            }
        }
    }
`

export const getSmolVerseMeta = gql`
    query qetSmolVerseMeta($id: String!){
        tokens(where: {id: id}){
            id
            video
            name
            description
            image
            owner {
                id
            }
            attributes{
                id
                name
                value
                percentage
                tokens {
                    id
                    video
                    tokenId
                }
            }
        }
`

export const getSmolverseMetadata = gql`
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

export const getUserInventory = gql`
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

export const getCollectionStats = gql`
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

export const getCollectionListings = gql`
    query getCollectionListings(
        $erc1155Filters: Token_filter
        $erc1155Ordering: Token_orderBy
        $erc721Filters: Listing_filter
        $erc721Ordering: Listing_orderBy
        $isERC1155: Boolean!
        $orderDirection: OrderDirection
        $skip: Int
    ) {
        tokens(
            first: 200 # This is okay as we will pull all the Treasures
            # orderBy: $erc1155Ordering
            orderBy: floorPrice
            orderDirection: $orderDirection
            where: $erc1155Filters
        ) @include(if: $isERC1155) {
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
            first: 42
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

export const getTokensByName = gql`
    query getTokensByName($lower: String!, $start: String!, $ids: [ID!]!) {
        lower: tokens(first: 1000, where: { name_contains: $lower, id_in: $ids }) {
            id
        }
        start: tokens(first: 1000, where: { name_contains: $start, id_in: $ids }) {
            id
        }
    }
`

const LISTING_FRAGMENT = gql`
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

const LISTING_FRAGMENT_WITH_TOKEN = gql`
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

export const getActivity = gql`
    ${LISTING_FRAGMENT}
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
`

export const getERC1155Listings = gql`
    ${LISTING_FRAGMENT_WITH_TOKEN}
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
`

export const getTokenExistsInWallet = gql`
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

export const getCollections = gql`
    query getCollections {
        collections(orderBy: name, where: { name_not: "Legions" }) {
            id
            contract
            name
        }
    }
`

export const getTokenDetails = gql`
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
`

export const getCollectionsListedTokens = gql`
    query getCollectionsListedTokens($collection: String!) {
        listings(first: 1000, where: { collection: $collection, status: Active, quantity_gt: 0 }, orderBy: id) {
            token {
                id
            }
        }
    }
`

export const getFloorPrice = gql`
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

export const searchItems = gql`
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

export const getRealmMetadata = gql`
    query getRealmMetadata($id: String!) {
        realms(where: { id: $id }) {
            id
            feature1
            feature2
            feature3
            metrics {
                name
                totalAmount
            }
            totalStructures {
                totalAquariums
                totalCities
                totalFarms
                totalResearchLabs
            }
        }
    }
`

export const getFilteredFeatures = gql`
    query getFilteredFeatures($ids: [ID!]!, $feature: [String!]) {
        feature1: realms(first: 1000, where: { id_in: $ids, feature1_in: $feature }) {
            id
        }
        feature2: realms(first: 1000, where: { id_in: $ids, feature2_in: $feature }) {
            id
        }
        feature3: realms(first: 1000, where: { id_in: $ids, feature3_in: $feature }) {
            id
        }
    }
`

export const getFilteredStructures = gql`
    query getFilteredStructures($filters: TotalStructure_filter!) {
        totalStructures(first: 1000, where: $filters) {
            id
        }
    }
`
