import { gql } from 'graphql-request'

// There are two API endpoints and the information they can provided is slightly different
export const TREASURE_API_URL = 'https://api.thegraph.com/subgraphs/name/wyze/treasure-marketplace'
export const TREASURE_API_URL_NEXT = 'https://api.thegraph.com/subgraphs/name/treasureproject/marketplace-next'
export const TREASURE_API_URL_BRIDGE_WORLD = 'https://api.thegraph.com/subgraphs/name/treasureproject/bridgeworld'
export const TREASURE_URL = 'https://treasure.lol'
export const IPFS_GATEWAY = 'https://ipfs.io/ipfs/'

export const MAGIC = '$MAGIC'

export const QUERY_TOKEN_DETAILS = gql`
    query getTokenDetails($collectionId: ID!, $tokenId: BigInt!) {
        collection(id: $collectionId) {
            id
            name
            creator {
                id
                name
                fee
            }
            standard
            tokens(where: { tokenId: $tokenId }) {
                id
                tokenId
                floorPrice
                metadata {
                    attributes {
                        attribute {
                            id
                            name
                            percentage
                            value
                        }
                    }
                    description
                    id
                    image
                    name
                }
                owner {
                    id
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
            }
        }
    }
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

export const QUERY_TOKEN_ALT = gql`
    query getTokenDetails($collectionId: ID!, $tokenId: BigInt!) {
        collection(id: $collectionId) {
            id
            name
            standard
            tokens(where: { tokenId: $tokenId }) {
                id
                tokenId
                floorPrice
                owners {
                    id
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
            }
        }
    }
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

export const QUERY_TOKEN_BRIDGEWORLD = gql`
    query getBridgeworldMetadata($id: ID!) {
        token(id: $id) {
            id
            image
            name
            description: name
            metadata {
                ... on LegionInfo {
                    boost
                    cooldown
                    crafting
                    questing
                    summons
                    rarity
                    role
                    type
                    summons
                    questingXp
                    craftingXp
                }
                ... on ConsumableInfo {
                    type
                    size
                }
                ... on TreasureInfo {
                    boost
                    category
                    tier
                }
            }
        }
    }
`

export const QUERY_COLLECTIONS = gql`
    query getCollections {
        collections(orderBy: name) {
            id
            name
        }
    }
`
