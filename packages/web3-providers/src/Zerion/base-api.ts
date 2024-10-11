import { createLookupTableResolver } from '@masknet/shared-base'
import { ChainId } from '@masknet/web3-shared-evm'
import { mapKeys } from 'lodash-es'
import io from 'socket.io-client'
import {
    SocketRequestNameSpace,
    type SocketRequestBody,
    type SocketNameSpace,
    SocketRequestType,
    type SocketResponseBody,
    type ZerionAssetResponseBody,
    type ZerionTransactionResponseBody,
    type ZerionNonFungibleTokenResponseBody,
    type ZerionGasResponseBody,
} from './types.js'
import { delay } from '@masknet/kit'

const ZERION_API = 'wss://api-v4.zerion.io'
// cspell:disable-next-line
const ZERION_TOKEN = 'Mask.yEUEfDnoxgLBwNEcYPVussxxjdrGwapj'

let socket: SocketIOClient.Socket | null = null

export const zerionChainIdResolver = createLookupTableResolver<string, ChainId | undefined>(
    {
        ethereum: ChainId.Mainnet,
        optimism: ChainId.Optimism,
        fantom: ChainId.Fantom,
        avalanche: ChainId.Avalanche,
        arbitrum: ChainId.Arbitrum,
        aurora: ChainId.Aurora,
        'binance-smart-chain': ChainId.BSC,
        xdai: ChainId.xDai,
        polygon: ChainId.Polygon,
    },
    () => undefined,
)

function createSocket(namespace: SocketRequestNameSpace = SocketRequestNameSpace.Address) {
    if (socket?.connected) return socket
    if (socket) socket.removeAllListeners()
    return (socket = io(`${ZERION_API}/${namespace}`, {
        transports: ['websocket'],
        query: {
            api_token: ZERION_TOKEN,
        },
        // disable the auto reconnection
        reconnection: false,
    }))
}

function verify(request: SocketRequestBody, response: any) {
    // each value in request payload must be found in response meta
    return Object.keys(request.payload).every((key) => {
        const requestValue = request.payload[key]
        const responseMetaValue = response.meta[key]
        if (typeof requestValue === 'object') {
            return JSON.stringify(requestValue) === JSON.stringify(responseMetaValue)
        }
        if (typeof requestValue === 'string') {
            return responseMetaValue?.toLowerCase() === requestValue.toLowerCase()
        }
        return responseMetaValue === requestValue
    })
}

function subscribeFromZerion(
    socketNamespace: SocketNameSpace,
    requestBody: SocketRequestBody,
    type = SocketRequestType.SUBSCRIBE,
) {
    return new Promise<SocketResponseBody>((resolve) => {
        const { socket, namespace } = socketNamespace
        const model = requestBody.scope[0]
        socket.emit(type, requestBody)
        socket.on(`received ${namespace} ${model}`, (data: SocketResponseBody) => {
            if (verify(requestBody, data)) {
                resolve(data)
            }
        })
    })
}

export async function getAssetsList(address: string, scope: string) {
    return (await subscribeFromZerion(
        {
            namespace: SocketRequestNameSpace.Address,
            socket: createSocket(),
        },
        {
            scope: [scope],
            payload: {
                address,
                currency: 'usd',
            },
        },
    )) as ZerionAssetResponseBody
}

export async function getTransactionList(address: string, scope: string, page?: number, size = 30) {
    return (await subscribeFromZerion(
        {
            namespace: SocketRequestNameSpace.Address,
            socket: createSocket(),
        },
        {
            scope: [scope],
            payload: {
                address,
                currency: 'usd',
                transactions_limit: size,
                transactions_offset: (page ?? 0) * size,
                transactions_search_query: '',
            },
        },
    )) as ZerionTransactionResponseBody
}

export async function getNonFungibleAsset(account: string, address: string, tokenId: string) {
    return Promise.race([
        subscribeFromZerion(
            {
                namespace: SocketRequestNameSpace.Address,
                socket: createSocket(),
            },
            {
                scope: ['nft'],
                payload: {
                    address: account,
                    nft_asset_code: `${address}:${tokenId}`,
                },
            },
        ) as Promise<ZerionNonFungibleTokenResponseBody>,
        delay(5_000),
    ])
}

export async function getNonFungibleAssets(address: string, page?: number, size = 20, contract_address?: string) {
    return Promise.race([
        subscribeFromZerion(
            { namespace: SocketRequestNameSpace.Address, socket: createSocket() },
            {
                scope: ['nft'],
                payload: {
                    address,
                    contract_addresses: contract_address ? [contract_address] : [],
                    mode: 'nft',
                    nft_limit: size,
                    nft_offset: (page ?? 0) * size,
                },
            },
            SocketRequestType.GET,
        ) as Promise<ZerionNonFungibleTokenResponseBody>,
        delay(5_000),
    ])
}
export async function getGasOptions(chainId: ChainId) {
    const response = (await subscribeFromZerion(
        {
            namespace: SocketRequestNameSpace.Gas,
            socket: createSocket(SocketRequestNameSpace.Gas),
        },
        {
            scope: ['chain-prices'],
            payload: {},
        },
        SocketRequestType.GET,
    )) as ZerionGasResponseBody

    if (!response.payload['chain-prices']) return

    const gasOptionsCollection = mapKeys(response.payload['chain-prices'], (_, key) => zerionChainIdResolver(key))

    return gasOptionsCollection[chainId].info.classic
}
