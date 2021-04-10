import { OpenSeaPort } from 'opensea-js'
import type { OrderSide, WyvernSchemaName } from 'opensea-js/lib/types'
import stringify from 'json-stable-stringify'
import { getChainId } from '../../../extension/background-script/EthereumService'
import { resolveOpenSeaNetwork } from '../pipes'
import { OpenSeaBaseURL, OpenSeaGraphQLURL, ReferrerAddress } from '../constants'
import { Flags } from '../../../utils/flags'
import type { OpenSeaAssetEventResponse, OpenSeaResponse } from '../UI/types'
import { OpenSeaEventHistoryQuery } from '../queries/OpenSea'

const apiKey = 'c38fe2446ee34f919436c32db480a2e3'

function createExternalProvider() {
    return {
        isMetaMask: false,
        isStatus: true,
        host: '',
        path: '',
        sendAsync: console.log,
        send: console.log,
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
        query: OpenSeaEventHistoryQuery,
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

export async function createBuyOrder(
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
