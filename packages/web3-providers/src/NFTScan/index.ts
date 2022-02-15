import { ChainId, createERC721ContractDetailed, createERC721Token } from '@masknet/web3-shared-evm'
import addSeconds from 'date-fns/addSeconds'
import isBefore from 'date-fns/isBefore'
import urlcat from 'urlcat'
import type { NonFungibleTokenAPI } from '..'
import { NFTSCAN_ACCESS_TOKEN_URL, NFTSCAN_BASE_API } from './constants'
import type { NFTScanAsset, NFT_Assets } from './types'
import { isProxyENV } from '../helpers'
import { toNonIPFSImage } from './utils'

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
    const response = await fetch(urlcat(NFTSCAN_BASE_API, path), {
        method: 'POST',
        headers: { 'Access-Token': await getToken(), 'Content-type': 'application/json' },
        body: JSON.stringify(body),
    })
    if (!response.ok) return
    return response.json() as Promise<{ data: T }>
}

function createERC721ContractDetailedFromAssetContract(asset: NFTScanAsset) {
    return createERC721ContractDetailed(
        ChainId.Mainnet,
        asset.trade_contract ?? asset.nft_contract_address,
        undefined,
        asset.trade_symbol,
    )
}

function createERC721TokenAsset(asset: NFTScanAsset) {
    const payload: {
        name?: string
        description?: string
        image?: string
    } = JSON.parse(asset.nft_json)
    const detailed = createERC721ContractDetailedFromAssetContract(asset)
    return createERC721Token(
        detailed,
        {
            name: payload?.name ?? asset.nft_name ?? asset.nft_platform_name ?? '',
            description: payload?.description ?? '',
            mediaUrl: toNonIPFSImage(asset.nft_cover ?? asset.nft_content_uri ?? payload.image ?? ''),
            owner: asset.nft_holder ?? '',
        },
        asset.token_id,
    )
}

export class NFTScanAPI implements NonFungibleTokenAPI.Provider {
    async getContractBalance(address: string) {
        const response = await fetchAsset<NFT_Assets[]>('getGroupByNftContract', {
            erc: 'erc721',
            user_address: address,
        })
        if (!response?.data) return []
        return response.data
            .map((x) => {
                const contractDetailed = createERC721ContractDetailed(
                    ChainId.Mainnet,
                    x.nft_contract_address,
                    x.nft_platform_name,
                    undefined,
                    undefined,
                    x.nft_platform_image,
                )
                const balance = x.nft_asset.length
                return { contractDetailed, balance }
            })
            .sort((a, b) => a.balance - b.balance)
    }

    async getToken(address: string, tokenId: string, chainId: ChainId) {
        const response = await fetchAsset<NFTScanAsset>('getSingleNft', {
            nft_address: address,
            token_id: tokenId,
        })
        if (!response) return
        return createERC721TokenAsset(response.data)
    }

    async getTokens(
        from: string,
        { chainId = ChainId.Mainnet, page = 0, size = 50, pageInfo }: NonFungibleTokenAPI.Options,
    ) {
        const response = await fetchAsset<{
            content: NFTScanAsset[]
            page_index: number
            page_size: number
            total: number
        }>('getAllNftByUserAddress', {
            page_size: size,
            page_index: page + 1,
            user_address: from,
            erc: pageInfo?.type ?? 'erc721',
        })
        if (!response?.data)
            return {
                data: [],
                hasNextPage: false,
            }
        const data =
            response.data.content.map(createERC721TokenAsset).map((x) => ({ ...x, provideBy: 'NFTScan' })) ?? []
        const total = response.data.total
        return {
            data,
            hasNextPage: total - (page + 1) * size > 0,
        }
    }
}

export function getNFTScanNFTList(address: string) {
    const nftScanAPI = new NFTScanAPI()
    return nftScanAPI.getContractBalance(address)
}

export function getNFTScanNFTs(address: string, type: 'erc721' | 'erc1155', page?: number, size?: number) {
    const nftScanAPI = new NFTScanAPI()
    return nftScanAPI.getTokens(address, { page, size, pageInfo: { type } })
}
