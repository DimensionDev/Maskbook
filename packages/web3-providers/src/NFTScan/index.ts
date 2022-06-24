import { DataProvider } from '@masknet/public-api'
import ERC721ABI from '@masknet/web3-contracts/abis/ERC721.json'
import type { ERC721 } from '@masknet/web3-contracts/types/ERC721'
import {
    createIndicator,
    createNextIndicator,
    createPageable,
    CurrencyType,
    HubOptions,
    NonFungibleAsset,
    TokenType,
} from '@masknet/web3-shared-base'
import { ChainId, createContract, getRPCConstants, SchemaType } from '@masknet/web3-shared-evm'
import addSeconds from 'date-fns/addSeconds'
import getUnixTime from 'date-fns/getUnixTime'
import isBefore from 'date-fns/isBefore'
import { first } from 'lodash-unified'
import urlcat from 'urlcat'
import Web3SDK from 'web3'
import type { AbiItem } from 'web3-utils'
import { courier } from '../helpers'
import { NonFungibleTokenAPI, TrendingAPI, TrendingCoinType } from '../types'
import { NFTSCAN_ACCESS_TOKEN_URL, NFTSCAN_BASE, NFTSCAN_BASE_API, NFTSCAN_LOGO_BASE } from './constants'
import type {
    NFTPlatformInfo,
    NFTScanAsset,
    NFTSearchData,
    SearchNFTPlatformNameResult,
    VolumeAndFloorRecord,
} from './types'

const IPFS_BASE = 'https://ipfs.io/ipfs/:id'
const tokenCache = new Map<'token', { token: string; expiration: Date }>()

type Result<T> = { data?: T; code: number }

async function getToken() {
    const token = tokenCache.get('token')
    if (token && isBefore(Date.now(), token.expiration)) {
        return token.token
    }
    const fetch = globalThis.r2d2Fetch ?? globalThis.fetch
    const response = await fetch(NFTSCAN_ACCESS_TOKEN_URL, { method: 'GET' })
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

async function getContractSymbol(address: string, chainId: ChainId) {
    const RPC_URL = first(getRPCConstants(chainId).RPC_URLS)
    if (!RPC_URL) return ''

    try {
        const web3 = new Web3SDK(RPC_URL)
        const contract = createContract<ERC721>(web3, address, ERC721ABI as AbiItem[])
        const symbol = await contract?.methods.symbol().call({})
        return symbol ?? ''
    } catch {
        return ''
    }
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

function createERC721TokenAsset(asset: NFTScanAsset): NonFungibleAsset<ChainId, SchemaType> {
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
            [CurrencyType.USD]: asset.last_price,
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

const prependIpfs = (url: string) => {
    if (!url || url.startsWith('http')) return url
    return `https://nftscan.mypinata.cloud/ipfs/${url}`
}

export class NFTScanAPI implements NonFungibleTokenAPI.Provider<ChainId, SchemaType>, TrendingAPI.Provider<ChainId> {
    async getAsset(address: string, tokenId: string) {
        const response = await fetchAsset<NFTScanAsset>('getSingleNft', {
            nft_address: address,
            token_id: tokenId,
        })
        if (!response) return
        return createERC721TokenAsset(response.data)
    }

    async getAssets(from: string, { chainId = ChainId.Mainnet, indicator, size = 50 }: HubOptions<ChainId> = {}) {
        const response = await fetchAsset<{
            content: NFTScanAsset[]
            page_index: number
            page_size: number
            total: number
        }>('getAllNftByUserAddress', {
            page_size: size,
            page_index: (indicator?.index ?? 0) + 1,
            user_address: from,
        })
        if (!response?.data) return createPageable([], createIndicator(indicator))
        const total = response.data.total
        const rest = total - ((indicator?.index ?? 0) + 1) * size
        return createPageable(
            response.data.content.map(createERC721TokenAsset) ?? [],
            createIndicator(indicator),
            rest > 0 ? createNextIndicator(indicator) : undefined,
        )
    }

    async getAssetsByCollection(
        address: string,
        { chainId = ChainId.Mainnet, indicator, size = 50 }: HubOptions<ChainId> = {},
    ) {
        const index = indicator?.index ?? 0
        const url = urlcat(NFTSCAN_BASE, '/nftscan/nftSearch', {
            searchValue: address,
            pageIndex: index,
            pageSize: size,
        })
        const response = await fetch(courier(url))
        if (!response.ok) return createPageable([], createIndicator(indicator))
        const result: Result<NFTSearchData> = await response.json()
        if (!result.data) return createPageable([], createIndicator(indicator))
        const [platformInfo, symbol] = await Promise.all([
            this.getNftPlatformInfo(address),
            getContractSymbol(address, chainId),
        ])
        const total = result.data.total
        const rest = total - (index + 1) * size
        return createPageable(
            result.data.nftList.map((x): NonFungibleAsset<ChainId, SchemaType> => {
                return {
                    contract: {
                        chainId,
                        name: platformInfo.name,
                        symbol,
                        address,
                        schema: SchemaType.ERC721,
                    },
                    id: x.nft_asset_number,
                    chainId,
                    tokenId: x.nft_asset_number,
                    type: TokenType.NonFungible,
                    address,
                    schema: SchemaType.ERC721,
                    metadata: {
                        chainId,
                        name: platformInfo.name,
                        symbol,
                        description: platformInfo.description,
                        imageURL: prependIpfs(x.cover),
                        mediaURL: prependIpfs(x.link),
                    },
                    link: urlcat(NFTSCAN_BASE, '/:address/:id', { address, id: x.nft_asset_number }),
                }
            }),
            createIndicator(indicator),
            rest > 0 ? createNextIndicator(indicator) : undefined,
        )
    }

    private async getNftPlatformInfo(address: string): Promise<NFTPlatformInfo> {
        const url = urlcat(NFTSCAN_BASE, '/nftscan/getNftPlatformInfo', {
            keyword: address,
        })
        const response = await fetch(courier(url))
        const result: { data: NFTPlatformInfo } = await response.json()
        return result.data
    }
    private async searchNftPlatformName(keyword: string): Promise<SearchNFTPlatformNameResult[]> {
        const url = urlcat(NFTSCAN_BASE, '/nftscan/searchNftPlatformName', {
            keyword,
        })
        const response = await fetch(courier(url))
        const result: { data: SearchNFTPlatformNameResult[] } = await response.json()
        return result.data ?? []
    }

    private async getContractVolumeAndFloorByRange(contract: string, range: string): Promise<VolumeAndFloorRecord[]> {
        const url = urlcat(NFTSCAN_BASE, '/nftscan/getContractVolumeAndFloorByRange', {
            contract,
            range,
        })
        const response = await fetch(courier(url))
        const result: { data: VolumeAndFloorRecord[] } = await response.json()
        return result.data ?? []
    }

    async getCoins(keyword: string, chainId = ChainId.Mainnet): Promise<TrendingAPI.Coin[]> {
        if (!keyword) return []
        const nfts = await this.searchNftPlatformName(keyword)

        const coins = await Promise.all(
            nfts.map(async (nft) => {
                const symbol = await getContractSymbol(nft.address, chainId)
                return {
                    id: nft.address,
                    name: nft.platform,
                    symbol,
                    type: TrendingCoinType.NonFungible,
                    address: nft.address,
                    contract_address: nft.address,
                }
            }),
        )
        return coins.filter((x) => x.symbol)
    }
    async getCurrencies(): Promise<TrendingAPI.Currency[]> {
        throw new Error('Not implemented yet.')
    }
    async getPriceStats(
        chainId: ChainId,
        coinId: string,
        currency: TrendingAPI.Currency,
        days: number,
    ): Promise<TrendingAPI.Stat[]> {
        const range = `${Math.min(days, 90)}d`
        const records = await this.getContractVolumeAndFloorByRange(coinId, range)
        return records.map((x) => [x.time, x.floor])
    }
    async getCoinTrending(
        chainId: ChainId,
        /** address as id */ id: string,
        currency: TrendingAPI.Currency,
    ): Promise<TrendingAPI.Trending> {
        const platformInfo = await this.getNftPlatformInfo(id)
        if (!platformInfo) {
            throw new Error(`NFTSCAN: Can not find token by address ${id}`)
        }
        const symbol = await getContractSymbol(id, chainId)
        return {
            lastUpdated: new Date().toJSON(),
            dataProvider: DataProvider.NFTSCAN,
            contracts: [{ chainId, address: platformInfo.address }],
            currency,
            coin: {
                id,
                name: platformInfo.name,
                symbol,
                address: platformInfo.address,
                contract_address: platformInfo.address,
                type: TrendingCoinType.NonFungible,
                description: platformInfo.description,
                image_url: platformInfo.image,
                community_urls: (
                    [
                        {
                            type: 'other',
                            link: platformInfo.website,
                        },
                        {
                            type: 'twitter',
                            link: platformInfo.twitter && `https://twitter.com/${platformInfo.twitter}`,
                        },
                        {
                            type: 'discord',
                            link: platformInfo.discord,
                        },
                    ] as const
                ).filter((x) => x.link),
            },
            market: {
                total_supply: platformInfo.total,
                current_price: platformInfo.floorPrice,
                floor_price: platformInfo.floorPrice,
                highest_price: platformInfo.highestPrice,
                owners_count: platformInfo.ownersCount,
                royalty: platformInfo.royalty,
                total_24h: platformInfo.trendingTotal_24h,
                volume_24h: platformInfo.trendingVolume_24h,
                average_volume_24h: platformInfo.trendingVolumeAverage_24h,
                volume_all: platformInfo.trendingVolume_all,
            },
            tickers: [],
        }
    }
}
