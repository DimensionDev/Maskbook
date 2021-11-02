export const OpenSeaEventHistoryQuery = `
    query EventHistoryQuery(
        $archetype: ArchetypeInputType
        $bundle: BundleSlug
        $collections: [CollectionSlug!]
        $categories: [CollectionSlug!]
        $eventTypes: [EventType!]
        $cursor: String
        $count: Int = 10
        $showAll: Boolean = false
        $identity: IdentityInputType
    ) {
        ...EventHistory_data_3WnwJ9
    }

    fragment AccountLink_data on AccountType {
        address
        chain {
            identifier
            id
        }
        user {
            publicUsername
            id
        }
        ...ProfileImage_data
        ...wallet_accountKey
    }

    fragment AssetCell_asset on AssetType {
        collection {
            name
            id
        }
        name
        ...AssetMedia_asset
        ...asset_url
    }

    fragment AssetCell_assetBundle on AssetBundleType {
        assetQuantities(first: 2) {
            edges {
                node {
                    asset {
                        collection {
                            name
                            id
                        }
                        name
                        ...AssetMedia_asset
                        ...asset_url
                        id
                    }
                    relayId
                    id
                }
            }
        }
        name
        slug
    }

    fragment AssetMedia_asset on AssetType {
        animationUrl
        backgroundColor
        collection {
            description
            displayData {
                cardDisplayStyle
            }
            imageUrl
            hidden
            name
            slug
            id
        }
        description
        name
        tokenId
        imageUrl
    }

    fragment AssetQuantity_data on AssetQuantityType {
        asset {
            ...Price_data
            id
        }
        quantity
    }

    fragment EventHistory_data_3WnwJ9 on Query {
        assetEvents(
            after: $cursor
            bundle: $bundle
            archetype: $archetype
            first: $count
            categories: $categories
            collections: $collections
            eventTypes: $eventTypes
            identity: $identity
            includeHidden: true
        ) {
            edges {
                node {
                    assetBundle @include(if: $showAll) {
                        ...AssetCell_assetBundle
                        id
                    }
                    assetQuantity {
                        asset @include(if: $showAll) {
                            ...AssetCell_asset
                            id
                        }
                        ...quantity_data
                        id
                    }
                    relayId
                    eventTimestamp
                    eventType
                    customEventName
                    devFee {
                        quantity
                        ...AssetQuantity_data
                        id
                    }
                    devFeePaymentEvent {
                        ...EventTimestamp_data
                        id
                    }
                    fromAccount {
                        address
                        ...AccountLink_data
                        id
                    }
                    price {
                        quantity
                        ...AssetQuantity_data
                        id
                    }
                    endingPrice {
                        quantity
                        ...AssetQuantity_data
                        id
                    }
                    seller {
                        ...AccountLink_data
                        id
                    }
                    toAccount {
                        ...AccountLink_data
                        id
                    }
                    winnerAccount {
                        ...AccountLink_data
                        id
                    }
                    ...EventTimestamp_data
                    id
                    __typename
                }
                cursor
            }
            pageInfo {
                endCursor
                hasNextPage
            }
        }
    }

    fragment EventTimestamp_data on AssetEventType {
        eventTimestamp
        transaction {
            blockExplorerLink
            id
        }
    }

    fragment Price_data on AssetType {
        decimals
        imageUrl
        symbol
        usdSpotPrice
        assetContract {
            blockExplorerLink
            id
        }
    }

    fragment ProfileImage_data on AccountType {
        imageUrl
        address
        chain {
            identifier
            id
        }
    }

    fragment asset_url on AssetType {
        assetContract {
            account {
                address
                chain {
                    identifier
                    id
                }
                id
            }
            id
        }
        tokenId
    }

    fragment quantity_data on AssetQuantityType {
        asset {
            decimals
            id
        }
        quantity
    }

    fragment wallet_accountKey on AccountType {
        address
        chain {
            identifier
            id
        }
    }
`
