import { OpenSeaPort } from 'opensea-js'
import { getChainId } from '../../../extension/background-script/EthereumService'
import { resolveOpenSeaNetwork } from '../pipes'
import { OpenSeaBaseURL } from '../constants'
import type { OpenSeaAccount, OpenSeaAsset, OpenSeaCollection, Order } from 'opensea-js/lib/types'

export interface OpenSeaCustomTrait {
    trait_type: string
    value: string
}

export interface OpenSeaCustomAccount extends OpenSeaAccount {
    profile_img_url: string
}

export interface OpenSeaCustomCollection extends OpenSeaCollection {
    safelist_request_status: string
}

export interface OpenSeaResponse extends OpenSeaAsset {
    animation_url: string
    owner: OpenSeaCustomAccount
    collection: OpenSeaCustomCollection
    creator: OpenSeaCustomAccount
    traits: OpenSeaCustomTrait[]
}

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
    })
}

export async function getAsset(tokenAddress: string, tokenId: string) {
    const sdkResponse = await (await createOpenSeaPort()).api.getAsset({ tokenAddress, tokenId })
    const fetchResponse = await (
        await fetch(`${OpenSeaBaseURL}asset/${tokenAddress}/${tokenId}`, { cache: 'force-cache' })
    ).json()
    return {
        ...sdkResponse,
        ...fetchResponse,
        owner: fetchResponse.owner,
        orders: sdkResponse.orders,
        assetContract: sdkResponse.assetContract,
    } as OpenSeaResponse
}

export async function getOrders() {
    return (await createOpenSeaPort()).api.getOrders()
}

export async function getOffers() {
    return (await createOpenSeaPort()).api.getOrders()
}
