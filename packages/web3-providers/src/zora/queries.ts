import { gql } from 'graphql-request'

export const getAssetQuery = gql`
    query getAsset($address: String!, $tokenId: String!) {
        Token(where: { address: { _eq: $address }, tokenId: { _eq: $tokenId } }) {
            tokenId
            name
            address
            owner
            metadata {
                json
            }
            v3Ask {
                askPrice
            }
            currentAuction {
                expiresAt
            }
            symbol
            tokenContract {
                name
            }
        }
    }
`

export const getTokenHistoryQuery = gql`
    query getTokenHistory($address: String!, $tokenId: String!) {
        Token(where: { address: { _eq: $address }, tokenId: { _eq: $tokenId } }) {
            transferEvents {
                blockTimestamp
                transaction {
                    mediaMints {
                        id
                        blockTimestamp
                        creator
                        address
                    }
                    auctionCreatedEvents {
                        id
                        reservePrice
                        tokenOwner
                        blockTimestamp
                        auctionCurrency
                    }
                    marketBidEvents(where: { status: { _eq: "FINALIZED" } }) {
                        id
                        blockTimestamp
                        amount
                        currencyAddress
                        bidder
                        recipient
                    }
                    auctionEndedEvents {
                        id
                        transaction {
                            blockTimestamp
                        }
                        tokenOwner
                        winner
                        auction {
                            lastBidAmount
                            auctionCurrency
                        }
                    }
                }
            }
        }
    }
`

export const getBidsQuery = gql`
    query getBidEvents($tokenAddress: String!, $tokenId: String!) {
        Token(where: { address: { _eq: $tokenAddress }, tokenId: { _eq: $tokenId } }) {
            transferEvents {
                transaction {
                    marketBidEvents(where: { status: { _eq: "FINALIZED" } }) {
                        blockTimestamp
                        amount
                        currencyAddress
                        transactionHash
                        recipient
                    }
                }
            }
        }
    }
`

export const getAsksQuery = gql`
    query getAskEvents($tokenAddress: String!, $tokenId: String!) {
        Token(where: { address: { _eq: $tokenAddress }, tokenId: { _eq: $tokenId } }) {
            transferEvents {
                transaction {
                    auctionCreatedEvents {
                        auctionCurrency
                        reservePrice
                        tokenOwner
                        blockTimestamp
                        transactionHash
                    }
                }
            }
        }
    }
`
