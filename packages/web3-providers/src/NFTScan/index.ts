import { NFTSCAN_BASE_API, NFTSCAN_ID, NFTSCAN_SECRET, NFTSCAN_URL } from './constants'
import type { NFTScanAsset, NFT_Assets } from './types'
import { createERC721ContractDetailed, ChainId, createERC721Token } from '@masknet/web3-shared-evm'
import type { NFTAsset, OrderSide } from '../types'
import urlcat from 'urlcat'
import addSeconds from 'date-fns/addSeconds'

const tokenCache = new Map<'token', { token: string; expiration: number }>()

async function getToken() {
    const token = tokenCache.get('token')
    if (token && Date.now() <= token.expiration) return token.token

    const response = await fetch(
        urlcat(NFTSCAN_URL, '/gw/token', {
            apiKey: NFTSCAN_ID,
            apiSecret: NFTSCAN_SECRET,
        }),
        {
            mode: 'cors',
        },
    )

    const { data }: { data: { accessToken: string; expiration: number } } = await response.json()
    tokenCache.set('token', {
        token: data.accessToken,
        expiration: addSeconds(Date.now(), data.expiration).getTime(),
    })
    return data.accessToken
}

async function fetchAsset(path: string, config: Partial<RequestInit> = {}) {
    const response = await fetch(`${NFTSCAN_BASE_API}/${path}`, {
        method: 'POST',
        ...config,
        headers: {
            'Access-Token': await getToken(),
        },
    })

    if (!response.ok) return

    return response.json()
}

function createERC721ContractDetailedFromAssetContract(asset: NFTScanAsset) {
    return createERC721ContractDetailed(
        ChainId.Mainnet,
        asset.trade_contract,
        'unknown name',
        asset.trade_symbol ?? 'unknown symbol',
    )
}

function createERC721TokenAsset(asset: NFTScanAsset) {
    const json = JSON.parse(asset.nft_json)
    return createERC721Token(
        createERC721ContractDetailedFromAssetContract(asset),
        {
            name: json.name ?? '',
            description: json.description ?? '',
            mediaUrl: json.image || '',
            owner: asset.nft_holder ?? '',
        },
        asset.token_id,
    )
}

export async function getContractBalance(address: string) {
    const response = await fetchAsset('getGroupByNftContract', {
        body: JSON.stringify({
            erc: 'erc721',
            user_address: address,
        }),
    })
    if (!response) return null

    const { data }: { data: NFT_Assets[] } = response

    return data
        .map((x) => {
            const contractDetailed = createERC721ContractDetailed(
                ChainId.Mainnet,
                x.nft_contract_address,
                x.nft_platform_name,
            )

            const balance = x.nft_asset.length

            return {
                contractDetailed,
                balance,
            }
        })
        .sort((a, b) => a.balance - b.balance)
}

export async function getNFT(address: string, tokenId: string, chainId: ChainId) {
    const response = await fetchAsset('getSingleNft', {
        body: JSON.stringify({
            nft_address: address,
            token_id: tokenId,
        }),
    })
    if (!response) return null

    const { data }: { data: NFTScanAsset } = response

    return createERC721TokenAsset(data)
}

export async function getNFTsByPagination(from: string, opts: { chainId: ChainId; page?: number; size?: number }) {
    const { size = 50, page = 0 } = opts

    const response = await fetchAsset('getAllNftByUserAddress', {
        body: JSON.stringify({
            page_size: size,
            page_index: page,
            use_address: from,
            erc: 'erc721',
        }),
    })
    if (!response) return []

    type ResponseData = {
        content: NFTScanAsset[]
        page_index: number
        page_size: number
        total: number
    }

    const { data }: { data: ResponseData } = response

    return data.content.map(createERC721TokenAsset)
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
