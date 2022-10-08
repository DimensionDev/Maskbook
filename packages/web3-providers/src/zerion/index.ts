import io from 'socket.io-client'
import { first, unionWith } from 'lodash-unified'
import { getEnumAsArray } from '@dimensiondev/kit'
import {
    Transaction,
    HubOptions,
    createPageable,
    createIndicator,
    Pageable,
    isSameAddress,
    TokenType,
    SourceType,
    createNextIndicator,
    HubIndicator,
} from '@masknet/web3-shared-base'
import { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import {
    SocketRequestBody,
    SocketNameSpace,
    SocketResponseBody,
    ZerionTransactionResponseBody,
    ZerionAssetResponseBody,
    SocketRequestType,
    ZerionNonFungibleTokenResponseBody,
    ZerionNonFungibleTokenItem,
} from './type.js'
import { formatAsset, formatTransactions } from './format.js'
import type { FungibleTokenAPI, HistoryAPI, NonFungibleTokenAPI } from '../types/index.js'
import { getAllEVMNativeAssets } from '../helpers.js'
import { createLookupTableResolver, EMPTY_LIST } from '@masknet/shared-base'

const ZERION_API = 'wss://api-v4.zerion.io'
// cspell:disable-next-line
const ZERION_TOKEN = 'Mask.yEUEfDnoxgLBwNEcYPVussxxjdrGwapj'

const ZERION_NFT_DETAIL_URL = 'https://app.zerion.io/nfts/'

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

async function getNonFugibleAsset(account: string, address: string, tokenId: string, scope: string) {
    return (await subscribeFromZerion(
        {
            namespace: 'address',
            socket: createSocket(),
        },
        {
            scope: [scope],
            payload: {
                address: account,
                nft_asset_code: `${address}:${tokenId}`,
            },
        },
    )) as ZerionNonFungibleTokenResponseBody
}

async function getNonFugibleAssets(address: string, scope: string, page?: number, size = 20) {
    return (await subscribeFromZerion(
        { namespace: 'address', socket: createSocket() },
        {
            scope: [scope],
            payload: {
                address,
                contract_addresses: [],
                mode: 'nft',
                nft_limit: size,
                nft_offset: (page ?? 0) * size,
            },
        },
        SocketRequestType.GET,
    )) as ZerionNonFungibleTokenResponseBody
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

export class ZerionNonFungibleTokenAPI implements NonFungibleTokenAPI.Provider<ChainId, SchemaType> {
    createNonFungibleTokenPermalink(address?: string, tokenId?: string) {
        if (!address || !tokenId) return
        return ZERION_NFT_DETAIL_URL + `${address}:${tokenId}`
    }
    createNonFungibleTokenAssetFromNFT(chainId: ChainId, nft: ZerionNonFungibleTokenItem) {
        return {
            chainId,
            id: `${chainId}_${nft.asset.contract_address}_${nft.asset.token_id}`,
            type: TokenType.NonFungible,
            schema: nft.standard === 'ERC1155' ? SchemaType.ERC1155 : SchemaType.ERC721,
            address: nft.asset.contract_address,
            tokenId: nft.asset.token_id,
            contract: {
                chainId,
                schema: nft.standard === 'ERC1155' ? SchemaType.ERC1155 : SchemaType.ERC721,
                address: nft.asset.contract_address,
                name: nft.asset.collection.name,
                symbol: nft.asset.symbol,
            },
            metadata: {
                chainId,
                name: nft.asset.collection.name,
                symbol: nft.asset.symbol,
            },
            source: SourceType.Zerion,
            link: this.createNonFungibleTokenPermalink(nft.asset.contract_address, nft.asset.token_id),
        }
    }

    async getAsset(address: string, tokenId: string, { chainId = ChainId.Mainnet, account }: HubOptions<ChainId> = {}) {
        const response = await getNonFugibleAsset(account, address, tokenId, 'nft')
        if (!response.payload.nft.length) return
        const payload = first(response.payload.nft)
        if (!payload) return
        return this.createNonFungibleTokenAssetFromNFT(chainId, payload)
    }
    async getAssets(
        account: string,
        { chainId = ChainId.Mainnet, indicator, size }: HubOptions<ChainId, HubIndicator> = {},
    ) {
        const response = await getNonFugibleAssets(account, 'nft', indicator?.index, size)
        if (!response.payload.nft.length) return createPageable(EMPTY_LIST, createIndicator(indicator))
        const assets = response.payload.nft.map((x) => this.createNonFungibleTokenAssetFromNFT(chainId, x))

        return createPageable(
            assets,
            createIndicator(indicator),
            assets.length ? createNextIndicator(indicator) : undefined,
        )
    }
}
