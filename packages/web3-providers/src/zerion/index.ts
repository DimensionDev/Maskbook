import io from 'socket.io-client'
import type {
    SocketRequestBody,
    SocketNameSpace,
    SocketResponseBody,
    ZerionTransactionResponseBody,
    ZerionAssetResponseBody,
    ZerionAddressAsset,
    ZerionAddressCovalentAsset,
    SocketRequestAssetScope,
} from './type'
import { values } from 'lodash-unified'
import { createLookupTableResolver, NetworkType } from '@masknet/web3-shared-evm'
import { formatAssets } from './format'
import type { Web3Plugin } from '@masknet/plugin-infra'

const ZERION_API = 'wss://api-v4.zerion.io'
const ZERION_TOKEN = 'Mask.yEUEfDnoxgLBwNEcYPVussxxjdrGwapj'

let socket: SocketIOClient.Socket | null = null

export const resolveZerionAssetsScopeName = createLookupTableResolver<NetworkType, string>(
    {
        [NetworkType.Ethereum]: 'assets',
        [NetworkType.Binance]: 'bsc-assets',
        [NetworkType.Polygon]: 'polygon-assets',
        [NetworkType.Arbitrum]: 'arbitrum-assets',
        [NetworkType.xDai]: 'xdai-assets',
    },
    '',
)

function createSocket() {
    if (socket?.connected) return socket
    if (socket) socket.removeAllListeners()
    return (socket = io(`${ZERION_API}/address`, {
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
        return responseMetaValue === requestValue
    })
}

function subscribeFromZerion(socketNamespace: SocketNameSpace, requestBody: SocketRequestBody) {
    return new Promise<SocketResponseBody>((resolve) => {
        const { socket, namespace } = socketNamespace
        const model = requestBody.scope[0]
        socket.emit('subscribe', requestBody)
        socket.on(`received ${namespace} ${model}`, (data: SocketResponseBody) => {
            if (verify(requestBody, data)) {
                resolve(data)
            }
        })
    })
}

export async function getTransactionListFromZerion(address: string, scope: string, page?: number, size = 30) {
    return (await subscribeFromZerion(
        {
            namespace: 'address',
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

export async function getAssetsList(address: string, scope: string) {
    return (await subscribeFromZerion(
        {
            namespace: 'address',
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

const filterAssetType = ['compound', 'trash', 'uniswap', 'uniswap-v2', 'nft']

type Asset = Web3Plugin.Asset<Web3Plugin.FungibleToken>

export async function getAssetListByZerion(address: string) {
    let result: Asset[] = []
    const scopes = ['assets', 'bsc-assets', 'polygon-assets', 'arbitrum-assets']
    for (const scope of scopes) {
        const { meta, payload } = await getAssetsList(address, scope)
        if (meta.status !== 'ok') throw new Error('Fail to load assets.')

        const assets = Object.entries(payload).map(([key, value]) => {
            if (key === 'assets') {
                const assetsList = (values(value) as ZerionAddressAsset[]).filter(
                    ({ asset }) =>
                        asset.is_displayable && !filterAssetType.some((type) => type === asset.type) && asset.icon_url,
                )
                return formatAssets(assetsList, key)
            }

            return formatAssets(values(value) as ZerionAddressCovalentAsset[], key as SocketRequestAssetScope)
        })

        result = [...result, ...assets.flat()]
    }

    return result
}
