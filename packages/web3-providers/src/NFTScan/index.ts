import urlcat from 'urlcat'
import {
    createNonFungibleToken,
    createNonFungibleTokenCollection,
    createNonFungibleTokenContract,
    createNonFungibleTokenMetadata,
    createPageable,
    HubOptions,
} from '@masknet/web3-shared-base'
import { ChainId, resolveIPFSLinkFromURL, SchemaType } from '@masknet/web3-shared-evm'
import addSeconds from 'date-fns/addSeconds'
import isBefore from 'date-fns/isBefore'
import getUnixTime from 'date-fns/getUnixTime'
import type { NonFungibleTokenAPI } from '..'
import { NFTSCAN_ACCESS_TOKEN_URL, NFTSCAN_BASE_API } from './constants'
import type { NFTScanAsset } from './types'
import { courier, isProxyENV } from '../helpers'

const tokenCache = new Map<'token', { token: string; expiration: Date }>()

async function getToken() {
    const token = tokenCache.get('token')
    if (token && isBefore(Date.now(), token.expiration)) {
        return token.token
    }
    const response = await fetch(NFTSCAN_ACCESS_TOKEN_URL, { ...(!isProxyENV() && { mode: 'cors' }) })
    const {
        data,
    }: {
        data: { accessToken: string; expiration: number }
    } = await response.json()
    tokenCache.set('token', {
        token: data.accessToken,
        expiration: addSeconds(Date.now(), data.expiration),
    })
    return data.accessToken
}

async function fetchAsset<T>(path: string, body?: unknown) {
    const url = courier(urlcat(NFTSCAN_BASE_API, path))
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Access-Token': await getToken(), 'Content-type': 'application/json' },
        body: JSON.stringify(body),
    })
    if (!response.ok) return
    return response.json() as Promise<{ data: T }>
}

function createERC721TokenAsset(asset: NFTScanAsset) {
    const payload: {
        name?: string
        description?: string
        image?: string
    } = JSON.parse(asset.nft_json ?? '{}')
    const name = payload?.name ?? asset.nft_name ?? asset.nft_platform_name ?? ''
    const description = payload?.description ?? ''
    const mediaURL = resolveIPFSLinkFromURL(
        JSON.parse(asset.nft_json ?? '{}').image ?? asset.nft_content_uri ?? payload.image ?? '',
    )

    return createNonFungibleToken(
        ChainId.Mainnet,
        asset.trade_contract ?? asset.nft_contract_address,
        SchemaType.ERC721,
        asset.nft_asset_id,
        asset.nft_holder,
        createNonFungibleTokenMetadata(
            ChainId.Mainnet,
            name,
            asset.trade_symbol,
            asset.nft_detail,
            description,
            undefined,
            mediaURL,
        ),
        createNonFungibleTokenContract(
            ChainId.Mainnet,
            SchemaType.ERC721,
            asset.trade_contract ?? asset.nft_contract_address,
            name,
            asset.trade_symbol,
        ),
        createNonFungibleTokenCollection(
            ChainId.Mainnet,
            name,
            name,
            description,
            mediaURL,
            false,
            getUnixTime(new Date(asset.nft_create_time)),
        ),
    )
}

export class NFTScanAPI implements NonFungibleTokenAPI.Provider<ChainId, SchemaType> {
    async getToken(address: string, tokenId: string) {
        const response = await fetchAsset<NFTScanAsset>('getSingleNft', {
            nft_address: address,
            token_id: tokenId,
        })
        if (!response) return
        return createERC721TokenAsset(response.data)
    }

    async getTokens(from: string, { chainId = ChainId.Mainnet, indicator = 0, size = 50 }: HubOptions<ChainId> = {}) {
        const response = await fetchAsset<{
            content: NFTScanAsset[]
            page_index: number
            page_size: number
            total: number
        }>('getAllNftByUserAddress', {
            page_size: size,
            page_index: indicator + 1,
            user_address: from,
        })
        if (!response?.data) return createPageable([], 0)
        const total = response.data.total
        return createPageable(
            response.data.content.map(createERC721TokenAsset) ?? [],
            indicator,
            total - (indicator + 1) * size > 0 ? indicator + 1 : undefined,
        )
    }
}
