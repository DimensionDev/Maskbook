import { OpenSeaPort } from 'opensea-js'
import type { OrderSide } from 'opensea-js/lib/types'
import stringify from 'json-stable-stringify'
import { getChainId } from '../../../extension/background-script/EthereumService'
import { resolveOpenSeaNetwork } from '../pipes'
import { OpenSeaAPI_Key, OpenSeaBaseURL, OpenSeaRinkebyBaseURL, OpenSeaGraphQLURL, ReferrerAddress } from '../constants'
import { Flags } from '../../../utils/flags'
import type { OpenSeaAssetEventResponse, OpenSeaResponse } from '../types'
import { OpenSeaEventHistoryQuery } from '../queries/OpenSea'
import { send } from '../../../extension/background-script/EthereumServices/send'
import { ChainId } from '../../../web3/types'
import { resolveChainName } from '../../../web3/pipes'
import { head } from 'lodash-es'

function createExternalProvider() {
    return {
        isMetaMask: false,
        isStatus: true,
        host: '',
        path: '',
        sendAsync: send,
        send,
        request() {
            throw new Error('The request method is not implemented.')
        },
    }
}

async function createOpenSeaPort() {
    const chainId = await getChainId()
    return new OpenSeaPort(
        createExternalProvider(),
        {
            networkName: resolveOpenSeaNetwork(chainId),
            apiKey: OpenSeaAPI_Key,
        },
        console.log,
    )
}

async function createOpenSeaAPI() {
    const chainId = await getChainId()
    if (![ChainId.Mainnet, ChainId.Rinkeby].includes(chainId))
        throw new Error(`${resolveChainName(chainId)} is not supported.`)
    return chainId === ChainId.Mainnet ? OpenSeaBaseURL : OpenSeaRinkebyBaseURL
}

export async function getAsset(tokenAddress: string, tokenId: string) {
    const sdkResponse = await (await createOpenSeaPort()).api.getAsset({ tokenAddress, tokenId })
    const fetchResponse = await (
        await fetch(`${await createOpenSeaAPI()}asset/${tokenAddress}/${tokenId}`, {
            cache: Flags.trader_all_api_cached_enabled ? 'force-cache' : undefined,
            mode: 'cors',
            headers: {
                'x-api-key': OpenSeaAPI_Key,
            },
        })
    ).json()

    const endTime = head<{ closing_date: Date }>(
        fetchResponse.orders.filter(
            (item: { side: number; closing_extendable: boolean }) => item.side === 1 && item.closing_extendable,
        ),
    )?.closing_date
    return {
        ...sdkResponse,
        ...fetchResponse,
        owner: fetchResponse.owner,
        orders: sdkResponse.orders,
        assetContract: sdkResponse.assetContract,
        endTime,
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

export async function createBuyOrder(payload: Parameters<OpenSeaPort['createBuyOrder']>[0]) {
    return (await createOpenSeaPort()).createBuyOrder({
        referrerAddress: ReferrerAddress,
        ...payload,
    })
}

export async function createSellOrder(payload: Parameters<OpenSeaPort['createSellOrder']>[0]) {
    return (await createOpenSeaPort()).createSellOrder(payload)
}

export async function fulfillOrder(payload: Parameters<OpenSeaPort['fulfillOrder']>[0]) {
    return (await createOpenSeaPort()).fulfillOrder({
        referrerAddress: ReferrerAddress,
        ...payload,
    })
}
