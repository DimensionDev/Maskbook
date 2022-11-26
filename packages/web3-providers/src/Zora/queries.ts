import { gql } from 'graphql-request'

const CurrencyAmount = gql`
    raw
    decimal
    currency {
        name
        address
        decimals
    }
`

const Page = gql`
    limit
    endCursor
    hasNextPage
`

const Network = gql`
    chain
`

const Transaction = gql`
    blockNumber
    blockTimestamp
    transactionHash
    logIndex
`

const Media = gql`
    url
    mimeType
    size
`

const Attribute = gql`
    traitType
    displayType
    value
`

const Price = gql`
    blockNumber
    nativePrice {
        ${CurrencyAmount}
    }
    chainTokenPrice {
        ${CurrencyAmount}
    }
    usdcPrice {
        ${CurrencyAmount}
    }
`

const Token = gql`
    tokenId
    collectionAddress
    collectionName
    mintInfo {
        mintContext {
            ${Transaction}
        }
        originatorAddress
        toAddress
        price {
            ${Price}
        }
    }
    networkInfo {
        ${Network}
    }
    tokenUrl
    tokenUrlMimeType
    content {
        ${Media}
    }
    image {
        ${Media}
    }
    owner
    tokenContract {
        collectionAddress
        chain
        name
        symbol
        totalSupply
        description
    }
    name
    description
    metadata
    attributes {
        ${Attribute}
    }
`

const Collection = gql`
    address
    description
    name
    symbol
    totalSupply
    networkInfo {
        ${Network}
    }
    attributes {
        traitType
        valueMetrics {
            value
            count
            percent
        }
    }
`

const Event = gql`
    networkInfo {
        ${Network}
    }
    transactionInfo {
        ${Transaction}
    }
    eventType
    collectionAddress
    tokenId
    properties {
        ... on MintEvent {
            originatorAddress
            toAddress
            price {
                ${Price}
            }
        }
        ... on Sale {
            transactionInfo {
                ${Transaction}
            }
            networkInfo {
                ${Network}
            }
            buyerAddress
            saleType
            price {
                ${Price}
            }
            sellerAddress
        }
        ... on TransferEvent {
            fromAddress
            toAddress
        }
        ... on V3AskEvent {
            address
            properties {
                ... on V3AskCreatedEventProperties {
                    seller
                    sellerFundsRecipient
                    askCurrency
                    askPrice
                    findersFeeBps
                    price {
                        ${Price}
                    }
                }
            }
        }
    }
`

export const GetTokenQuery = gql`
    query getToken($address: String!, $tokenId: String!) {
        token(
            token: {
                address: $address,
                tokenId: $tokenId
            }
        ) {
            token {
                ${Token}
            }
        }
    }
`

export const GetTokensQuery = gql`
    query getTokens($ownerAddresses: [String!], $size: Int = 20) {
        tokens(
            pagination: {
                limit: $size
            },
            where: {
                ownerAddresses: $ownerAddresses
            }
        ) {
            nodes {
                Token {
                    ${Token}
                }
            }
            pageInfo {
                ${Page}
            }
        }
    }
`

export const GetEventsQuery = gql`
    query getEvents($address: String!, $tokenId: String!, $eventTypes: [EventType!], $size: Int = 20) {
        events(
            filter: {
                eventTypes: $eventTypes
            },
            pagination: {
                limit: $size
            },
            where: {
                tokens: [
                    {
                        address: $address,
                        tokenId: $tokenId
                    }
                ]
            }
        ) {
            nodes {
                ${Event}
            }
            pageInfo {
                ${Page}
            }
        }
    }
`

export const GetCollectionsByKeywordQuery = gql`
    query getCollections($keyword: String!, $size: Int = 20) {
        search(
            pagination: {
                limit: $size
            },
            query: {
                text: $keyword
            },
            filter: {
                entityType: COLLECTION
            }
        ) {
            nodes {
                name
                description
                entityType
                collectionAddress
                entity {
                    ... on Collection {
                        ${Collection}
                    }
                }
                networkInfo {
                    ${Network}
                }
            }
            pageInfo {
                ${Page}
            }
        }
    }
`
