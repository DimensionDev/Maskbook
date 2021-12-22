import { ChainId, createERC721ContractDetailed, createERC721Token, ERC721TokenInfo } from '@masknet/web3-shared-evm'
import addSeconds from 'date-fns/addSeconds'
import isBefore from 'date-fns/isBefore'
import urlcat from 'urlcat'
import type { NFTAsset, OrderSide } from '../types'
import { NFTSCAN_ACCESS_TOKEN_URL, NFTSCAN_BASE_API } from './constants'
import type { NFTScanAsset, NFT_Assets } from './types'

const tokenCache = new Map<'token', { token: string; expiration: Date }>()

async function getToken() {
    const token = tokenCache.get('token')
    if (token && isBefore(Date.now(), token.expiration)) {
        return token.token
    }
    const response = await fetch(NFTSCAN_ACCESS_TOKEN_URL, { mode: 'cors' })
    interface Payload {
        data: { accessToken: string; expiration: number }
    }
    const { data }: Payload = await response.json()
    tokenCache.set('token', {
        token: data.accessToken,
        expiration: addSeconds(Date.now(), data.expiration),
    })
    return data.accessToken
}

async function fetchAsset<T>(path: string, body?: unknown) {
    const response = await fetch(urlcat(NFTSCAN_BASE_API, path), {
        method: 'POST',
        headers: { 'Access-Token': await getToken() },
        body: JSON.stringify(body),
    })
    if (!response.ok) return
    return response.json() as Promise<{ data: T }>
}

function createERC721ContractDetailedFromAssetContract(asset: NFTScanAsset) {
    return createERC721ContractDetailed(ChainId.Mainnet, asset.trade_contract, undefined, asset.trade_symbol)
}

function createERC721TokenAsset(asset: NFTScanAsset) {
    interface Payload {
        name?: string
        description?: string
        image?: string
    }
    const payload: Payload = JSON.parse(asset.nft_json)
    const detailed = createERC721ContractDetailedFromAssetContract(asset)
    const info: ERC721TokenInfo = {
        name: payload.name ?? '',
        description: payload.description ?? '',
        mediaUrl: payload.image ?? '',
        owner: asset.nft_holder ?? '',
    }
    return createERC721Token(detailed, info, asset.token_id)
}

export async function getContractBalance(address: string) {
    const response = await fetchAsset<NFT_Assets[]>('getGroupByNftContract', {
        erc: 'erc721',
        user_address: address,
    })
    if (!response) return null
    return response.data
        .map((x) => {
            const contractDetailed = createERC721ContractDetailed(
                ChainId.Mainnet,
                x.nft_contract_address,
                x.nft_platform_name,
            )
            const balance = x.nft_asset.length
            return { contractDetailed, balance }
        })
        .sort((a, b) => a.balance - b.balance)
}

export async function getNFT(address: string, tokenId: string, chainId: ChainId) {
    const response = await fetchAsset<NFTScanAsset>('getSingleNft', {
        nft_address: address,
        token_id: tokenId,
    })
    if (!response) return null
    return createERC721TokenAsset(response.data)
}

export async function getNFTsByPagination(from: string, opts: { chainId: ChainId; page?: number; size?: number }) {
    const { size = 50, page = 0 } = opts
    interface Payload {
        content: NFTScanAsset[]
        page_index: number
        page_size: number
        total: number
    }
    const response = await fetchAsset<Payload>('getAllNftByUserAddress', {
        page_size: size,
        page_index: page,
        use_address: from,
        erc: 'erc721',
    })
    if (!response) return []
    return response.data.content.map(createERC721TokenAsset)
}

export async function getAsset(address: string, tokenId: string, chainId: ChainId) {
    return {} as NFTAsset
}

export async function getHistory(address: string, tokenId: string, chainId: ChainId) {
    return []
}

export async function getListings(address: string, tokenId: string, chainId: ChainId) {
    return []
}

export async function getOrders(address: string, tokenId: string, side: OrderSide, chainId: ChainId) {
    return []
}

export async function getCollections(address: string, opts: { chainId: ChainId; page?: number; size?: number }) {
    return []
}
