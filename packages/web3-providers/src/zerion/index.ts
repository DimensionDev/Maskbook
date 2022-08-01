import io from 'socket.io-client'
import { unionWith, values } from 'lodash-unified'
import { getEnumAsArray } from '@dimensiondev/kit'
import {
    FungibleAsset,
    Transaction,
    HubOptions,
    createPageable,
    createIndicator,
    Pageable,
} from '@masknet/web3-shared-base'
import { ChainId, getZerionConstant, SchemaType } from '@masknet/web3-shared-evm'
import type {
    SocketRequestBody,
    SocketNameSpace,
    SocketResponseBody,
    ZerionTransactionResponseBody,
    ZerionAssetResponseBody,
    ZerionAddressAsset,
    ZerionAddressCovalentAsset,
} from './type'
import { formatAssets, formatTransactions } from './format'
import type { FungibleTokenAPI, HistoryAPI } from '../types'
import { getAllEVMNativeAssets } from '../helpers'

const ZERION_API = 'wss://api-v4.zerion.io'
// cspell:disable-next-line
const ZERION_TOKEN = 'Mask.yEUEfDnoxgLBwNEcYPVussxxjdrGwapj'

let socket: SocketIOClient.Socket | null = null

export function resolveZerionAssetsScopeName(chainId: ChainId) {
    return getZerionConstant(chainId, 'ASSETS_SCOPE_NAME', '')!
}

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

async function getAssetsList(address: string, scope: string) {
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

async function getTransactionList(address: string, scope: string, page?: number, size = 30) {
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

const filterAssetType = ['compound', 'trash', 'uniswap', 'uniswap-v2', 'nft']

export class ZerionAPI
    implements FungibleTokenAPI.Provider<ChainId, SchemaType>, HistoryAPI.Provider<ChainId, SchemaType>
{
    async getAssets(address: string, options?: HubOptions<ChainId>) {
        let result: Array<FungibleAsset<ChainId, SchemaType>> = []
        const pairs = getEnumAsArray(ChainId).map(
            (x) => [x.value, getZerionConstant(x.value, 'ASSETS_SCOPE_NAME')] as const,
        )
        const allSettled = await Promise.allSettled(
            pairs.map(async ([chainId, scope]) => {
                if (!scope) return []

                const { meta, payload } = await getAssetsList(address, scope)
                if (meta.status !== 'ok') []

                return Object.entries(payload)
                    .map(([key, value]) => {
                        if (key === 'assets') {
                            const assetsList = (values(value) as ZerionAddressAsset[]).filter(
                                ({ asset }) =>
                                    asset.is_displayable &&
                                    !filterAssetType.some((type) => type === asset.type) &&
                                    asset.icon_url,
                            )
                            return formatAssets(chainId, assetsList)
                        }
                        return formatAssets(chainId, values(value) as ZerionAddressCovalentAsset[])
                    })
                    .flat()
            }),
        )

        const assets = allSettled.flatMap((x) => (x.status === 'fulfilled' ? x.value : []))

        return createPageable(
            unionWith(assets, getAllEVMNativeAssets(), (a, z) => a.symbol === z.symbol),
            createIndicator(options?.indicator),
        )
    }

    async getTransactions(
        address: string,
        { indicator }: HubOptions<ChainId> = {},
    ): Promise<Pageable<Transaction<ChainId, SchemaType>>> {
        // xdai-assets is not support
        const pairs = getEnumAsArray(ChainId).map(
            (x) => [x.value, getZerionConstant(x.value, 'TRANSACTIONS_SCOPE_NAME')] as const,
        )
        const allSettled = await Promise.allSettled(
            pairs.map(async ([chainId, scope]) => {
                if (!scope) return []
                const { meta, payload } = await getTransactionList(address, scope)
                if (meta.status !== 'ok') return []
                return formatTransactions(chainId, payload.transactions)
            }),
        )
        const transactions = allSettled.flatMap((x) => (x.status === 'fulfilled' ? x.value : []))

        return createPageable(transactions, createIndicator(indicator))
    }
}
