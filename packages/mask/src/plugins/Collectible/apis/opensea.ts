import { head } from 'lodash-unified'
import { OpenSeaPort } from 'opensea-js'
import { ChainId } from '@masknet/web3-shared-evm'
import { request, requestSend } from '../../../extension/background-script/EthereumService'
import { resolveOpenSeaNetwork } from '../pipes'
import { OpenSeaAPI_Key, OpenSeaBaseURL, OpenSeaRinkebyBaseURL, ReferrerAddress } from '../constants'
import { currentChainIdSettings } from '../../Wallet/settings'
import urlcat from 'urlcat'
import type { AssetOrder, OpenSeaAssetEvent, OpenSeaResponse } from '../types'

function createExternalProvider() {
    return {
        isMetaMask: false,
        isStatus: true,
        host: '',
        path: '',
        sendAsync: requestSend,
        send: requestSend,
        request,
    }
}

async function createOpenSeaPort(chainId?: ChainId) {
    return createOpenSeaPortChain(chainId ?? currentChainIdSettings.value)
}

async function createOpenSeaPortChain(chainId: ChainId.Mainnet | ChainId.Rinkeby) {
    return new OpenSeaPort(
        createExternalProvider(),
        {
            networkName: resolveOpenSeaNetwork(chainId),
            apiKey: OpenSeaAPI_Key,
        },
        console.log,
    )
}

async function createOpenSeaAPI(chainId: ChainId) {
    if (chainId === ChainId.Rinkeby) return OpenSeaRinkebyBaseURL
    return OpenSeaBaseURL
}

export async function getAssetFromSDK(tokenAddress: string, tokenId: string, chainId?: ChainId) {
    chainId = chainId ?? currentChainIdSettings.value
    return (await createOpenSeaPort(chainId)).api.getAsset({ tokenAddress, tokenId })
}

export async function getAsset(tokenAddress: string, tokenId: string, chainId?: ChainId) {
    chainId = chainId ?? currentChainIdSettings.value
    const requestPath = urlcat(await createOpenSeaAPI(chainId), '/asset/:tokenAddress/:tokenId', {
        tokenAddress,
        tokenId,
    })
    const response = await fetch(requestPath, { mode: 'cors', headers: { 'x-api-key': OpenSeaAPI_Key } })
    const payload = await response.json()
    interface Order extends AssetOrder {
        closing_date: Date
    }
    const filtered = (payload.orders as Order[]).filter((item) => item.side === 1)
    const endTime = head(filtered)?.closing_date
    return { ...payload, endTime } as OpenSeaResponse
}

export async function getEvents(asset_contract_address: string, token_id: string, page = 0, size = 10) {
    const requestPath = urlcat(await createOpenSeaAPI(currentChainIdSettings.value), '/events', {
        asset_contract_address,
        token_id,
        offset: page,
        limit: size,
    })
    const response = await fetch(requestPath, {
        mode: 'cors',
        headers: { 'x-api-key': OpenSeaAPI_Key },
    })
    interface Payload {
        asset_events: OpenSeaAssetEvent[]
    }
    const payload: Payload = await response.json()
    return payload.asset_events
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
