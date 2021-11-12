import { head, toString } from 'lodash-es'
import { OpenSeaPort } from 'opensea-js'
import { ChainId } from '@masknet/web3-shared-evm'
import { request, requestSend } from '../../../extension/background-script/EthereumService'
import { resolveOpenSeaNetwork } from '../pipes'
import { OpenSeaAPI_Key, OpenSeaBaseURL, OpenSeaRinkebyBaseURL, ReferrerAddress } from '../constants'
import { currentChainIdSettings } from '../../Wallet/settings'
import urlcat from 'urlcat'
import type { OpenSeaAssetEvent, OpenSeaResponse } from '../types'

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
    const _chainId = chainId ?? currentChainIdSettings.value
    const sdkResponse = await (await createOpenSeaPort(_chainId)).api.getAsset({ tokenAddress, tokenId })
    return sdkResponse
}

export async function getAsset(tokenAddress: string, tokenId: string, chainId?: ChainId) {
    const _chainId = chainId ?? currentChainIdSettings.value
    const fetchResponse = await (
        await fetch(
            urlcat(await createOpenSeaAPI(_chainId), '/asset/:tokenAddress/:tokenId', { tokenAddress, tokenId }),
            {
                mode: 'cors',
                headers: {
                    'x-api-key': OpenSeaAPI_Key,
                },
            },
        )
    ).json()

    const endTime = head<{ closing_date: Date }>(
        fetchResponse.orders.filter((item: { side: number; closing_extendable: boolean }) => item.side === 1),
    )?.closing_date

    return {
        ...fetchResponse,
        endTime,
    } as OpenSeaResponse
}

export async function getEvents(asset_contract_address: string, token_id: string, page?: number, size?: number) {
    const params = new URLSearchParams()
    params.append('asset_contract_address', asset_contract_address)
    params.append('token_id', token_id)
    params.append('offset', toString(page ?? 0))
    params.append('limit', toString(size ?? 10))

    const fetchResponse = await (
        await fetch(urlcat(await createOpenSeaAPI(currentChainIdSettings.value), `events?${params.toString()}`), {
            mode: 'cors',
            headers: { 'x-api-key': OpenSeaAPI_Key },
        })
    ).json()

    const { asset_events }: { asset_events: OpenSeaAssetEvent[] } = fetchResponse
    return asset_events
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
