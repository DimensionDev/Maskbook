import { DataProvider } from '@masknet/public-api'
import { EMPTY_LIST } from '@masknet/shared-base'
import {
    createIndicator,
    createNextIndicator,
    createPageable,
    HubOptions,
    NonFungibleAsset,
    TokenType,
} from '@masknet/web3-shared-base'
import { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import urlcat from 'urlcat'
import { compact } from 'lodash-unified'
import { LooksRare, OpenSea } from '../index'
import { LooksRareLogo, OpenSeaLogo } from '../resources'
import { NonFungibleMarketplace, NonFungibleTokenAPI, TrendingAPI } from '../types'
import { NFTSCAN_API, NFTSCAN_BASE } from './constants'
import {
    Collection,
    ErcType,
    NFTPlatformInfo,
    NFTScanAsset,
    NFTSearchData,
    SearchNFTPlatformNameResult,
    UserAssetsGroup,
    VolumeAndFloorRecord,
} from './types'
import { createERC721TokenAsset, fetchFromNFTScan, fetchV2, getContractSymbol, prependIpfs } from './utils'

type Result<T> = { data?: T; code: number }

export class NFTScanAPI implements NonFungibleTokenAPI.Provider<ChainId, SchemaType>, TrendingAPI.Provider<ChainId> {
    async getAsset(address: string, tokenId: string) {
        const path = urlcat('/assets/:address/:token_id', {
            address,
            token_id: tokenId,
        })
        const [data, verifiedStatus] = await Promise.all([
            fetchV2<NFTScanAsset>(path),
            this.getCollectionVerifiedStatus(address),
        ])
        if (!data) return
        const token = createERC721TokenAsset(data)
        if (token.collection) {
            token.collection = {
                ...token.collection,
                verified: verifiedStatus,
            }
        }
        return token
    }

    async getAssets(from: string, { chainId = ChainId.Mainnet, indicator, size = 20 }: HubOptions<ChainId> = {}) {
        const path = urlcat('/account/own/all/:from', {
            from,
            size,
        })
        const assetGroup = await fetchV2<UserAssetsGroup[]>(path, { erc_type: ErcType.ERC721 })
        const assets = assetGroup?.flatMap((x) => x.assets.map(createERC721TokenAsset)) ?? []
        return createPageable(assets, createIndicator(indicator))
    }

    async getAssetsByCollection(
        address: string,
        { chainId = ChainId.Mainnet, indicator, size = 20 }: HubOptions<ChainId> = {},
    ) {
        const index = indicator?.index ?? 0
        const url = urlcat(NFTSCAN_API, '/nftscan/nftSearch', {
            searchValue: address,
            pageIndex: index,
            pageSize: size,
        })
        const response = await fetchFromNFTScan(url)
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
                        name: x.nft_name,
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

    private async getCollectionVerifiedStatus(address: string) {
        const collection = await fetchV2<Collection>(urlcat('collections/:address', { address }))
        return collection?.verified ?? false
    }

    private async getNftPlatformInfo(address: string): Promise<NFTPlatformInfo> {
        const url = urlcat(NFTSCAN_API, '/nftscan/getNftPlatformInfo', {
            keyword: address,
        })
        const response = await fetchFromNFTScan(url)
        const result: { data: NFTPlatformInfo } = await response.json()
        return result.data
    }
    private async searchNftPlatformName(keyword: string): Promise<SearchNFTPlatformNameResult[]> {
        const url = urlcat(NFTSCAN_API, '/nftscan/searchNftPlatformName', {
            keyword,
        })
        const response = await fetchFromNFTScan(url)
        const result: { data: SearchNFTPlatformNameResult[] } = await response.json()
        return result.data ?? EMPTY_LIST
    }

    private async getContractVolumeAndFloorByRange(contract: string, range: string): Promise<VolumeAndFloorRecord[]> {
        const url = urlcat(NFTSCAN_API, '/nftscan/getContractVolumeAndFloorByRange', {
            contract,
            range,
        })
        const response = await fetchFromNFTScan(url)
        const result: { data: VolumeAndFloorRecord[] } = await response.json()
        return result.data ?? EMPTY_LIST
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
