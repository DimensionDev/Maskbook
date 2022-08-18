import { DataProvider } from '@masknet/public-api'
import { EMPTY_LIST } from '@masknet/shared-base'
import {
    createIndicator,
    createNextIndicator,
    createPageable,
    HubIndicator,
    HubOptions,
    NonFungibleTokenCollection,
    NonFungibleTokenContract,
    NonFungibleTokenEvent,
    Pageable,
    TokenType,
} from '@masknet/web3-shared-base'
import { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import urlcat from 'urlcat'
import { compact } from 'lodash-unified'
import { LooksRare, OpenSea } from '../index'
import { LooksRareLogo, OpenSeaLogo } from '../resources'
import { NonFungibleMarketplace, NonFungibleTokenAPI, TrendingAPI } from '../types'
import { NFTSCAN_API } from './constants'
import {
    ErcType,
    NFTPlatformInfo,
    Asset,
    Collection,
    SearchNFTPlatformNameResult,
    AssetsGroup,
    VolumeAndFloorRecord,
    Transaction,
} from './types'
import {
    createNonFungibleTokenAsset,
    createNonFungibleTokenContract,
    fetchFromNFTScan,
    fetchFromNFTScanV2,
    getContractSymbol,
    createNonFungibleTokenEvent,
    createNonFungibleTokenCollectionFromGroup,
    createNonFungibleTokenCollectionFromCollection,
} from './utils'

export class NFTScanAPI implements NonFungibleTokenAPI.Provider<ChainId, SchemaType>, TrendingAPI.Provider<ChainId> {
    async getAsset(address: string, tokenId: string, { chainId = ChainId.Mainnet }: HubOptions<ChainId> = {}) {
        const path = urlcat('/api/v2/assets/:address/:token_id', {
            address,
            contract_address: address,
            token_id: tokenId,
            show_attribute: true,
        })
        const response = await fetchFromNFTScanV2<{ data: Asset }>(chainId, path)
        if (!response?.data) return
        return createNonFungibleTokenAsset(chainId, response.data)
    }

    async getAssets(account: string, { chainId = ChainId.Mainnet, indicator, size = 20 }: HubOptions<ChainId> = {}) {
        const path = urlcat('/api/v2/account/own/all/:from', {
            from: account,
            erc_type: ErcType.ERC721,
            show_attribute: true,
        })
        const response = await fetchFromNFTScanV2<{ data: AssetsGroup[] }>(chainId, path)
        const assets =
            response?.data?.flatMap((x) => x.assets.map((x) => createNonFungibleTokenAsset(chainId, x))) ?? EMPTY_LIST
        return createPageable(assets, createIndicator(indicator))
    }

    async getAssetsByCollection(
        address: string,
        { chainId = ChainId.Mainnet, indicator, size = 20 }: HubOptions<ChainId> = {},
    ) {
        const path = urlcat('/api/v2/assets/:address', {
            address,
            contract_address: address,
            show_attribute: true,
            limit: size,
            cursor: indicator?.id,
        })
        const response = await fetchFromNFTScanV2<{
            data: {
                content: Asset[]
                next?: string
                total?: number
            }
        }>(chainId, path)
        const assets = response?.data?.content.map((x) => createNonFungibleTokenAsset(chainId, x)) ?? EMPTY_LIST
        return createPageable(
            assets,
            createIndicator(indicator),
            response?.data.next ? createNextIndicator(indicator, response?.data.next) : undefined,
        )
    }

    async getCollectionsByOwner(
        account: string,
        { chainId = ChainId.Mainnet, indicator }: HubOptions<ChainId, HubIndicator> = {},
    ): Promise<Pageable<NonFungibleTokenCollection<ChainId, SchemaType>, HubIndicator>> {
        const path = urlcat('/api/v2/account/own/all/:from', {
            from: account,
            erc_type: ErcType.ERC721,
            show_attribute: true,
        })
        const response = await fetchFromNFTScanV2<{ data: AssetsGroup[] }>(chainId, path)
        const collections =
            response?.data.map((x) => createNonFungibleTokenCollectionFromGroup(chainId, x)) ?? EMPTY_LIST
        return createPageable(collections, createIndicator(indicator))
    }

    async getCollectionsByKeyword(
        keyword: string,
        { chainId = ChainId.Mainnet, indicator, size = 20 }: HubOptions<ChainId, HubIndicator> = {},
    ): Promise<Pageable<NonFungibleTokenCollection<ChainId, SchemaType>, HubIndicator>> {
        const path = '/api/v2/collections/filters'
        const response = await fetchFromNFTScanV2<{ data: Collection[] }>(chainId, path, {
            method: 'POST',
            body: JSON.stringify({
                name: keyword,
                symbol: '',
                limit: size.toString(),
                offset: indicator?.index ?? '',
                contract_address_list: [],
            }),
        })
        const collections =
            response?.data.map((x) => createNonFungibleTokenCollectionFromCollection(chainId, x)) ?? EMPTY_LIST
        return createPageable(collections, createIndicator(indicator))
    }

    async getContract(
        address: string,
        { chainId = ChainId.Mainnet }: HubOptions<ChainId, HubIndicator> = {},
    ): Promise<NonFungibleTokenContract<ChainId, SchemaType> | undefined> {
        const path = urlcat('/api/v2/collections/:address', {
            address,
        })
        const response = await fetchFromNFTScanV2<{ data: Collection }>(chainId, path)
        if (!response?.data) return
        return createNonFungibleTokenContract(chainId, response.data)
    }

    async getEvents(
        address: string,
        tokenId: string,
        { chainId = ChainId.Mainnet, indicator, size = 20 }: HubOptions<ChainId, HubIndicator> = {},
    ): Promise<Pageable<NonFungibleTokenEvent<ChainId, SchemaType>>> {
        const path = urlcat('/api/v2/transactions/:address/:tokenId', {
            address,
            tokenId,
            limit: size,
            cursor: indicator?.id,
        })
        const response = await fetchFromNFTScanV2<{ data: { content: Transaction[]; next?: string; total?: number } }>(
            chainId,
            path,
        )
        const events = response?.data.content.map((x) => createNonFungibleTokenEvent(chainId, x)) ?? EMPTY_LIST
        return createPageable(
            events,
            createIndicator(indicator),
            response?.data.next ? createNextIndicator(indicator, response?.data.next) : undefined,
        )
    }

    private async getNftPlatformInfo(address: string): Promise<NFTPlatformInfo> {
        const url = urlcat(NFTSCAN_API, '/nftscan/getNftPlatformInfo', {
            keyword: address,
        })
        const response = await fetchFromNFTScan<{ data: NFTPlatformInfo }>(url)
        return response.data
    }

    private async searchNftPlatformName(keyword: string): Promise<SearchNFTPlatformNameResult[]> {
        const url = urlcat(NFTSCAN_API, '/nftscan/searchNftPlatformName', {
            keyword,
        })
        const response = await fetchFromNFTScan<{ data: SearchNFTPlatformNameResult[] }>(url)
        return response.data ?? EMPTY_LIST
    }

    private async getContractVolumeAndFloorByRange(contract: string, range: string): Promise<VolumeAndFloorRecord[]> {
        const url = urlcat(NFTSCAN_API, '/nftscan/getContractVolumeAndFloorByRange', {
            contract,
            range,
        })
        const response = await fetchFromNFTScan<{ data: VolumeAndFloorRecord[] }>(url)
        return response.data ?? EMPTY_LIST
    }

    async getCoins(keyword: string, chainId = ChainId.Mainnet): Promise<TrendingAPI.Coin[]> {
        if (!keyword) return EMPTY_LIST
        const nfts = await this.searchNftPlatformName(keyword)

        const coins = await Promise.all(
            nfts.map(async (nft): Promise<TrendingAPI.Coin> => {
                const symbol = await getContractSymbol(nft.address, chainId)
                return {
                    id: nft.address,
                    name: nft.platform,
                    symbol,
                    type: TokenType.NonFungible,
                    address: nft.address,
                    contract_address: nft.address,
                    image_url: nft.image,
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
        const [symbol, openseaStats, looksrareStats] = await Promise.all([
            getContractSymbol(id, chainId),
            OpenSea.getStats(platformInfo.address).catch(() => null),
            LooksRare.getStats(platformInfo.address).catch(() => null),
        ])
        const tickers: TrendingAPI.Ticker[] = compact([
            openseaStats
                ? {
                      logo_url: OpenSeaLogo,
                      // TODO
                      trade_url: `https://opensea.io/assets/ethereum/${platformInfo.address}`,
                      market_name: NonFungibleMarketplace.OpenSea,
                      volume_24h: openseaStats.volume24h,
                      floor_price: openseaStats.floorPrice,
                      sales_24: openseaStats.count24h,
                  }
                : null,
            looksrareStats
                ? {
                      logo_url: LooksRareLogo,
                      trade_url: `https://looksrare.org/collections/${platformInfo.address}`,
                      market_name: NonFungibleMarketplace.LooksRare,
                      volume_24h: looksrareStats.volume24h,
                      floor_price: looksrareStats.floorPrice,
                      sales_24: looksrareStats.count24h,
                  }
                : null,
        ])
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
                type: TokenType.NonFungible,
                description: platformInfo.description,
                image_url: platformInfo.image,
                home_urls: compact([platformInfo.website]),
                community_urls: [
                    {
                        type: 'twitter',
                        link: platformInfo.twitter && `https://twitter.com/${platformInfo.twitter}`,
                    },
                    {
                        type: 'facebook',
                        // TODO format of facebook url is unknown
                        link: null,
                    },
                    {
                        type: 'discord',
                        link: platformInfo.discord,
                    },
                    {
                        type: 'instagram',
                        link: platformInfo.instagram && `https://www.instagram.com/${platformInfo.instagram}`,
                    },
                    {
                        type: 'medium',
                        link: platformInfo.medium && `https://medium.com/@${platformInfo.medium}`,
                    },
                    {
                        type: 'reddit',
                        link: platformInfo.reddit,
                    },
                    {
                        type: 'telegram',
                        link: platformInfo.reddit,
                    },
                    {
                        type: 'youtube',
                        link: platformInfo.youtube,
                    },
                    {
                        type: 'github',
                        link: platformInfo.github,
                    },
                ].filter((x) => x.link) as TrendingAPI.CommunityUrls,
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
            tickers,
        }
    }
}
