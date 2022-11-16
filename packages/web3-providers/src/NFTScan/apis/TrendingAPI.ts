import urlcat from 'urlcat'
import { compact } from 'lodash-es'
import { DataProvider } from '@masknet/public-api'
import { createLookupTableResolver, EMPTY_LIST } from '@masknet/shared-base'
import { TokenType, attemptUntil } from '@masknet/web3-shared-base'
import { ChainId, isValidChainId } from '@masknet/web3-shared-evm'
import { LooksRareLogo, OpenSeaLogo } from '../../resources/index.js'
import { TrendingAPI } from '../../types/index.js'
import { NFTSCAN_API } from '../constants.js'
import type { EVM, Response } from '../types/index.js'
import { fetchFromNFTScan, fetchFromNFTScanV2, getContractSymbol } from '../helpers/EVM.js'
import { LooksRareAPI } from '../../looksrare/index.js'
import { OpenSeaAPI } from '../../opensea/index.js'

enum NonFungibleMarketplace {
    OpenSea = 'OpenSea',
    LooksRare = 'LooksRare',
}

const resolveNFTScanRange = createLookupTableResolver<TrendingAPI.Days, string>(
    {
        [TrendingAPI.Days.MAX]: 'all',
        [TrendingAPI.Days.ONE_DAY]: '1d',
        [TrendingAPI.Days.ONE_WEEK]: '7d',
        [TrendingAPI.Days.ONE_MONTH]: '1mth',
        [TrendingAPI.Days.THREE_MONTHS]: '3mth',
        [TrendingAPI.Days.ONE_YEAR]: '1y',
    },
    // NFTScan will discard range unrecognized range
    () => '',
)

const NFTSCAN_CHAIN_ID_LIST = [ChainId.Mainnet, ChainId.BSC, ChainId.Matic]

export class NFTScanTrendingAPI implements TrendingAPI.Provider<ChainId> {
    private looksrare = new LooksRareAPI()
    private opensea = new OpenSeaAPI()

    private async getCollection(chainId: ChainId, address: string): Promise<EVM.Collection | undefined> {
        if (!isValidChainId(chainId)) return
        const path = urlcat('/api/v2/collections/:address', {
            address,
            contract_address: address,
        })
        const response = await fetchFromNFTScanV2<Response<EVM.Collection>>(chainId, path)
        return response?.data
    }

    private async searchNFTCollection(chainId: ChainId, keyword: string): Promise<EVM.Collection[]> {
        if (!isValidChainId(chainId)) return EMPTY_LIST
        const path = '/api/v2/collections/filters'
        const response = await fetchFromNFTScanV2<Response<EVM.Collection[]>>(chainId, path, {
            method: 'POST',
            body: JSON.stringify({
                name: keyword,
                symbol: keyword,
                sort_direction: 'desc',
                sort_field: 'floor_price',
                name_fuzzy_search: true,
            }),
        })
        return response?.data ?? EMPTY_LIST
    }

    private async getContractVolumeAndFloorByRange(
        contract: string,
        range: string,
    ): Promise<EVM.VolumeAndFloorRecord[]> {
        const url = urlcat(NFTSCAN_API, '/nftscan/getContractVolumeAndFloorByRange', {
            contract,
            range,
        })
        const response = await fetchFromNFTScan<Response<EVM.VolumeAndFloor>>(url)
        // We only care about the record list
        return response.data?.result ?? EMPTY_LIST
    }

    getAllCoins(): Promise<TrendingAPI.Coin[]> {
        return Promise.resolve(EMPTY_LIST)
    }

    async getCoinsByKeyword(chainId: ChainId, keyword: string): Promise<TrendingAPI.Coin[]> {
        if (!keyword || !isValidChainId(chainId)) return EMPTY_LIST
        const nfts = await this.searchNFTCollection(chainId, keyword)

        const coins: TrendingAPI.Coin[] = nfts.map((nft) => ({
            id: nft.contract_address,
            name: nft.name,
            symbol: nft.symbol,
            type: TokenType.NonFungible,
            address: nft.contract_address,
            contract_address: nft.contract_address,
            image_url: nft.logo_url,
        }))
        return coins.slice(0, 10)
    }

    async getCoinPriceStats(
        chainId: ChainId,
        coinId: string,
        currency: TrendingAPI.Currency,
        days: number,
    ): Promise<TrendingAPI.Stat[]> {
        const range = resolveNFTScanRange(days)
        const records = await this.getContractVolumeAndFloorByRange(coinId, range)
        return records.map((x) => [x.time, x.price])
    }

    async getCoinTrending(
        _chainId: ChainId,
        /** address as id */ id: string,
        currency: TrendingAPI.Currency,
    ): Promise<TrendingAPI.Trending> {
        const result = await attemptUntil(
            NFTSCAN_CHAIN_ID_LIST.map((chainId) => async () => {
                try {
                    const collection = await this.getCollection(chainId, id)
                    if (!collection?.contract_address) return undefined
                    return { collection, chainId }
                } catch {
                    return undefined
                }
            }),
            undefined,
        )
        if (!result) {
            throw new Error(`NFTSCAN: Can not find token by address ${id}`)
        }
        const { collection, chainId } = result
        const address = collection.contract_address
        const [symbol, openseaStats, looksrareStats] = await Promise.all([
            getContractSymbol(id, chainId),
            this.opensea.getStats(address).catch(() => null),
            this.looksrare.getStats(address).catch(() => null),
        ])
        const tickers: TrendingAPI.Ticker[] = compact([
            openseaStats
                ? {
                      logo_url: OpenSeaLogo,
                      // TODO
                      trade_url: `https://opensea.io/assets/ethereum/${address}`,
                      market_name: NonFungibleMarketplace.OpenSea,
                      volume_24h: openseaStats.volume24h,
                      floor_price: openseaStats.floorPrice,
                      price_symbol: collection.price_symbol,
                      sales_24: openseaStats.count24h,
                  }
                : null,
            looksrareStats
                ? {
                      logo_url: LooksRareLogo,
                      trade_url: `https://looksrare.org/collections/${address}`,
                      market_name: NonFungibleMarketplace.LooksRare,
                      volume_24h: looksrareStats.volume24h,
                      floor_price: looksrareStats.floorPrice,
                      price_symbol: collection.price_symbol,
                      sales_24: looksrareStats.count24h,
                  }
                : null,
        ])
        return {
            lastUpdated: new Date().toJSON(),
            dataProvider: DataProvider.NFTScan,
            contracts: [{ chainId, address }],
            currency,
            coin: {
                id,
                name: collection.name,
                symbol,
                address,
                contract_address: address,
                type: TokenType.NonFungible,
                description: collection.description,
                image_url: collection.logo_url,
                home_urls: compact([collection.website]),
                community_urls: [
                    {
                        type: 'twitter',
                        link: collection.twitter?.startsWith('https://twitter.com/')
                            ? collection.twitter
                            : `https://twitter.com/${collection.twitter}`,
                    },
                    {
                        type: 'facebook',
                        // TODO format of facebook url is unknown
                        link: null,
                    },
                    {
                        type: 'discord',
                        link: collection.discord,
                    },
                    {
                        type: 'instagram',
                        link: collection.instagram?.startsWith('https://instagram.com/')
                            ? collection.instagram
                            : `https://www.instagram.com/${collection.instagram}`,
                    },
                    {
                        type: 'medium',
                        link: collection.medium?.startsWith('https://instagram.com/@')
                            ? collection.medium
                            : `https://medium.com/@${collection.medium}`,
                    },
                    {
                        type: 'reddit',
                        link: collection.reddit,
                    },
                    {
                        type: 'telegram',
                        link: collection.telegram,
                    },
                    {
                        type: 'youtube',
                        link: collection.youtube,
                    },
                    {
                        type: 'github',
                        link: collection.github,
                    },
                ].filter((x) => x.link) as TrendingAPI.CommunityUrls,
            },
            market: {
                total_supply: collection.items_total,
                current_price: collection.floor_price,
                floor_price: collection.floor_price,
                highest_price: undefined,
                owners_count: collection.owners_total,
                price_symbol: collection.price_symbol,
                royalty: collection.royalty?.toString(),
                total_24h: undefined,
                volume_24h: undefined,
                average_volume_24h: undefined,
                volume_all: undefined,
            },
            tickers,
        }
    }
}
