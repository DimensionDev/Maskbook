import urlcat from 'urlcat'
import { createPageable, CurrencyType, HubOptions, TokenType } from '@masknet/web3-shared-base'
import { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import addSeconds from 'date-fns/addSeconds'
import isBefore from 'date-fns/isBefore'
import getUnixTime from 'date-fns/getUnixTime'
import type { NonFungibleTokenAPI } from '..'
import { NFTSCAN_ACCESS_TOKEN_URL, NFTSCAN_BASE, NFTSCAN_BASE_API, NFTSCAN_LOGO_BASE } from './constants'
import type { NFTScanAsset } from './types'
import { courier, isProxyENV } from '../helpers'

const IPFS_BASE = 'https://ipfs.io/ipfs/:id'
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
    const description = payload?.description ?? asset.nft_detail
    const mediaURL = urlcat(IPFS_BASE, { id: asset.nft_cover })
    const chainId = ChainId.Mainnet
    const creator = asset.nft_creator
    const owner = asset.nft_holder

    return {
        id: asset.nft_contract_address,
        chainId,
        tokenId: asset.token_id ?? asset.nft_asset_id,
        type: TokenType.NonFungible,
        address: asset.nft_contract_address,
        schema: SchemaType.ERC721,
        creator: {
            address: creator,
            avatarURL: '',
            nickname: creator,
            link: urlcat(NFTSCAN_BASE + '/:id', { id: creator }),
        },
        owner: {
            address: owner,
            avatarURL: '',
            nickname: owner,
            link: urlcat(NFTSCAN_BASE + '/:id', { id: owner }),
        },
        traits: [],
        price: {
            [CurrencyType.NATIVE]: asset.last_price,
        },

        metadata: {
            chainId,
            name,
            symbol: asset.trade_symbol,
            description,
            imageURL: mediaURL,
            mediaURL,
        },
        contract: {
            chainId,
            schema: SchemaType.ERC721,
            address: asset.nft_contract_address,
            name,
            symbol: asset.trade_symbol,
        },
        collection: {
            chainId,
            name,
            slug: name,
            description,
            iconURL: urlcat(NFTSCAN_LOGO_BASE + '/:id', { id: asset.nft_contract_address + '.png' }),
            verified: !!asset.nft_asset_id,
            createdAt: getUnixTime(new Date(asset.nft_create_time)),
        },
    }
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
