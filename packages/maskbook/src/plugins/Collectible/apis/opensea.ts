import { OpenSeaPort } from 'opensea-js'
import type { OrderSide, WyvernSchemaName } from 'opensea-js/lib/types'
import stringify from 'json-stable-stringify'
import { getChainId } from '../../../extension/background-script/EthereumService'
import { resolveOpenSeaNetwork } from '../pipes'
import { OpenSeaBaseURL, OpenSeaGraphQLURL, ReferrerAddress } from '../constants'
import { Flags } from '../../../utils/flags'
import type { OpenSeaAssetEventResponse, OpenSeaResponse } from '../UI/types'

const apiKey = 'c38fe2446ee34f919436c32db480a2e3'

function createExternalProvider() {
    return {
        isMetaMask: false,
        isStatus: true,
        host: '',
        path: '',
        sendAsync: console.log,
        send: console.log, // {version:sdfsdfdf}
        request: console.log,
    }
}

async function createOpenSeaPort() {
    const chainId = await getChainId()
    return new OpenSeaPort(createExternalProvider(), {
        networkName: resolveOpenSeaNetwork(chainId),
        apiKey,
    })
}

export async function getAsset(tokenAddress: string, tokenId: string) {
    const sdkResponse = await (await createOpenSeaPort()).api.getAsset({ tokenAddress, tokenId })
    const fetchResponse = await (
        await fetch(`${OpenSeaBaseURL}asset/${tokenAddress}/${tokenId}`, {
            cache: Flags.trader_all_api_cached_enabled ? 'force-cache' : undefined,
            mode: 'cors',
            headers: {
                'x-api-key': apiKey,
            },
        })
    ).json()
    return {
        ...sdkResponse,
        ...fetchResponse,
        owner: fetchResponse.owner,
        orders: sdkResponse.orders,
        assetContract: sdkResponse.assetContract,
    } as OpenSeaResponse
}

export async function getEvents(asset_contract_address: string, token_id: string, cursor?: string, count = 10) {
    const query = {
        id: 'EventHistoryQuery',
        query:
            'query EventHistoryQuery(\n  $archetype: ArchetypeInputType\n  $bundle: BundleSlug\n  $collections: [CollectionSlug!]\n  $categories: [CollectionSlug!]\n  $eventTypes: [EventType!]\n  $cursor: String\n  $count: Int = 10\n  $showAll: Boolean = false\n  $identity: IdentityInputType\n) {\n  ...EventHistory_data_3WnwJ9\n}\n\nfragment AccountLink_data on AccountType {\n  address\n  chain {\n    identifier\n    id\n  }\n  user {\n    publicUsername\n    id\n  }\n  ...ProfileImage_data\n  ...wallet_accountKey\n}\n\nfragment AssetCell_asset on AssetType {\n  collection {\n    name\n    id\n  }\n  name\n  ...AssetMedia_asset\n  ...asset_url\n}\n\nfragment AssetCell_assetBundle on AssetBundleType {\n  assetQuantities(first: 2) {\n    edges {\n      node {\n        asset {\n          collection {\n            name\n            id\n          }\n          name\n          ...AssetMedia_asset\n          ...asset_url\n          id\n        }\n        relayId\n        id\n      }\n    }\n  }\n  name\n  slug\n}\n\nfragment AssetMedia_asset on AssetType {\n  animationUrl\n  backgroundColor\n  collection {\n    description\n    displayData {\n      cardDisplayStyle\n    }\n    imageUrl\n    hidden\n    name\n    slug\n    id\n  }\n  description\n  name\n  tokenId\n  imageUrl\n}\n\nfragment AssetQuantity_data on AssetQuantityType {\n  asset {\n    ...Price_data\n    id\n  }\n  quantity\n}\n\nfragment EventHistory_data_3WnwJ9 on Query {\n  assetEvents(after: $cursor, bundle: $bundle, archetype: $archetype, first: $count, categories: $categories, collections: $collections, eventTypes: $eventTypes, identity: $identity, includeHidden: true) {\n    edges {\n      node {\n        assetBundle @include(if: $showAll) {\n          ...AssetCell_assetBundle\n          id\n        }\n        assetQuantity {\n          asset @include(if: $showAll) {\n            ...AssetCell_asset\n            id\n          }\n          ...quantity_data\n          id\n        }\n        relayId\n        eventTimestamp\n        eventType\n        customEventName\n        devFee {\n          quantity\n          ...AssetQuantity_data\n          id\n        }\n        devFeePaymentEvent {\n          ...EventTimestamp_data\n          id\n        }\n        fromAccount {\n          address\n          ...AccountLink_data\n          id\n        }\n        price {\n          quantity\n          ...AssetQuantity_data\n          id\n        }\n        endingPrice {\n          quantity\n          ...AssetQuantity_data\n          id\n        }\n        seller {\n          ...AccountLink_data\n          id\n        }\n        toAccount {\n          ...AccountLink_data\n          id\n        }\n        winnerAccount {\n          ...AccountLink_data\n          id\n        }\n        ...EventTimestamp_data\n        id\n        __typename\n      }\n      cursor\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n  }\n}\n\nfragment EventTimestamp_data on AssetEventType {\n  eventTimestamp\n  transaction {\n    blockExplorerLink\n    id\n  }\n}\n\nfragment Price_data on AssetType {\n  decimals\n  imageUrl\n  symbol\n  usdSpotPrice\n  assetContract {\n    blockExplorerLink\n    id\n  }\n}\n\nfragment ProfileImage_data on AccountType {\n  imageUrl\n  address\n  chain {\n    identifier\n    id\n  }\n}\n\nfragment asset_url on AssetType {\n  assetContract {\n    account {\n      address\n      chain {\n        identifier\n        id\n      }\n      id\n    }\n    id\n  }\n  tokenId\n}\n\nfragment quantity_data on AssetQuantityType {\n  asset {\n    decimals\n    id\n  }\n  quantity\n}\n\nfragment wallet_accountKey on AccountType {\n  address\n  chain {\n    identifier\n    id\n  }\n}\n',
        variables: {
            archetype: {
                assetContractAddress: asset_contract_address,
                tokenId: token_id,
            },
            bundle: null,
            collections: null,
            categories: null,
            eventTypes: null,
            cursor: cursor,
            count,
            showAll: false,
            identity: null,
        },
    }
    const response = await fetch(OpenSeaGraphQLURL, {
        cache: Flags.trader_all_api_cached_enabled ? 'force-cache' : undefined,
        method: 'POST',
        body: stringify(query),
    })
    const { data } = await response.json()

    return data.assetEvents as OpenSeaAssetEventResponse
}

export async function getOrders(
    asset_contract_address: string,
    token_id: string,
    side: OrderSide,
    opts = { pageNum: 1, count: 10 },
) {
    return (await createOpenSeaPort()).api.getOrders({
        asset_contract_address,
        token_id,
        side,
        limit: opts.count,
        offset: opts.count * opts.pageNum,
    })
}

export async function creteBuyOrder(
    asset_contract_address: string,
    token_id: string,
    schema: WyvernSchemaName,
    account: string,
) {
    return (await createOpenSeaPort()).createBuyOrder({
        asset: {
            tokenId: token_id,
            tokenAddress: asset_contract_address,
            schemaName: schema,
        },
        accountAddress: account,
        referrerAddress: ReferrerAddress,
        paymentTokenAddress: '',
        startAmount: 0.0001,
    })
}
