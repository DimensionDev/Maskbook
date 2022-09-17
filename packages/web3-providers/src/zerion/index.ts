import io from 'socket.io-client'
import { unionWith } from 'lodash-unified'
import { getEnumAsArray } from '@dimensiondev/kit'
import {
    Transaction,
    HubOptions,
    createPageable,
    createIndicator,
    Pageable,
    isSameAddress,
} from '@masknet/web3-shared-base'
import { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import type {
    SocketRequestBody,
    SocketNameSpace,
    SocketResponseBody,
    ZerionTransactionResponseBody,
    ZerionAssetResponseBody,
} from './type.js'
import { formatAsset, formatTransactions } from './format.js'
import type { FungibleTokenAPI, HistoryAPI } from '../types/index.js'
import { getAllEVMNativeAssets } from '../helpers.js'
import { createLookupTableResolver, EMPTY_LIST } from '@masknet/shared-base'

const ZERION_API = 'wss://api-v4.zerion.io'
// cspell:disable-next-line
const ZERION_TOKEN = 'Mask.yEUEfDnoxgLBwNEcYPVussxxjdrGwapj'

let socket: SocketIOClient.Socket | null = null

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
        if (typeof requestValue === 'string') {
            return responseMetaValue.toLowerCase() === requestValue.toLowerCase()
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

const zerionChainIdResolver = createLookupTableResolver<string, ChainId | undefined>(
    {
        ethereum: ChainId.Mainnet,
        optimism: ChainId.Optimism,
        fantom: ChainId.Fantom,
        avalanche: ChainId.Avalanche,
        arbitrum: ChainId.Arbitrum,
        aurora: ChainId.Aurora,
        'binance-smart-chain': ChainId.BSC,
        xdai: ChainId.xDai,
        polygon: ChainId.Matic,
    },
    () => undefined,
)

export class ZerionAPI
    implements FungibleTokenAPI.Provider<ChainId, SchemaType>, HistoryAPI.Provider<ChainId, SchemaType>
{
    async getAssets(address: string, options?: HubOptions<ChainId>) {
        const { meta, payload } = await getAssetsList(address, 'positions')
        if (meta.status !== 'ok') return createPageable(EMPTY_LIST, createIndicator(options?.indicator))

        const assets =
            payload.positions?.positions
                .filter(
                    (x) =>
                        x.type === 'asset' &&
                        x.asset.icon_url &&
                        x.asset.is_displayable &&
                        !filterAssetType.includes(x.asset.type) &&
                        zerionChainIdResolver(x.chain),
                )
                ?.map((x) => {
                    return formatAsset(zerionChainIdResolver(x.chain)!, x)
                }) ?? EMPTY_LIST

        return createPageable(
            unionWith(
                assets,
                getAllEVMNativeAssets(),
                (a, z) => isSameAddress(a.address, z.address) && a.chainId === z.chainId,
            ),
            createIndicator(options?.indicator),
        )
    }

    async getTransactions(
        address: string,
        { indicator }: HubOptions<ChainId> = {},
    ): Promise<Pageable<Transaction<ChainId, SchemaType>>> {
        const pairs = getEnumAsArray(ChainId).map((x) => [x.value, 'transactions'] as const)
        const allSettled = await Promise.allSettled(
            pairs.map(async ([chainId, scope]) => {
                if (!scope) return EMPTY_LIST
                const { meta, payload } = await getTransactionList(address, scope)
                if (meta.status !== 'ok') return EMPTY_LIST
                return formatTransactions(chainId, payload.transactions)
            }),
        )
        const transactions = allSettled.flatMap((x) => (x.status === 'fulfilled' ? x.value : []))

        return createPageable(transactions, createIndicator(indicator))
    }
}
