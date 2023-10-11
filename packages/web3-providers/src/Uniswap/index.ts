import { TokenType, SourceType } from '@masknet/web3-shared-base'
import { ChainId } from '@masknet/web3-shared-evm'
import { isMirroredKeyword } from '../Trending/helpers.js'
import * as BaseAPI from './base-api.js'
import { BTC_FIRST_LEGER_DATE, getAllCoinsByKeyword, getPriceStats as getStats } from './base-api.js'
import type { TrendingAPI } from '../entry-types.js'

export enum Days {
    MAX = 0,
    ONE_DAY = 1,
    ONE_WEEK = 7,
    ONE_MONTH = 30,
    ONE_YEAR = 365,
}

export class UniswapAPI implements TrendingAPI.Provider<ChainId> {
    getAllCoins(): Promise<TrendingAPI.Coin[]> {
        return Promise.resolve([])
    }

    getCoinsByKeyword(chainId: ChainId, keyword: string): Promise<TrendingAPI.Coin[]> {
        return getAllCoinsByKeyword(chainId, keyword)
    }

    async getCoinTrending(chainId: ChainId, id: string, currency: TrendingAPI.Currency): Promise<TrendingAPI.Trending> {
        const { token, marketInfo, tickersInfo } = await BaseAPI.getCoinInfo(chainId ?? ChainId.Mainnet, id)
        return {
            currency,
            dataProvider: SourceType.UniswapInfo,
            market: marketInfo,
            coin: {
                id,
                chainId,
                name: token?.name || '',
                symbol: token?.symbol || '',
                type: TokenType.Fungible,
                decimals: Number(token?.decimals || '0'),
                is_mirrored: isMirroredKeyword(token?.symbol || ''),
                blockchain_urls: [`https://info.uniswap.org/token/${id}`, `https://etherscan.io/address/${id}`],
                image_url: `https://raw.githubusercontent.com/dimensiondev/assets/master/blockchains/ethereum/assets/${id}/logo.png`,
                platform_url: `https://info.uniswap.org/token/${id}`,
                contract_address: id,
            },
            tickers: tickersInfo,
            lastUpdated: '',
        }
    }

    getCoinInfoByAddress(address: string): Promise<TrendingAPI.CoinInfo | undefined> {
        throw new Error('To be implemented.')
    }

    getCoinPriceStats(
        chainId: ChainId,
        coinId: string,
        currency: TrendingAPI.Currency,
        days: number,
    ): Promise<TrendingAPI.Stat[]> {
        const endTime = new Date()
        const startTime = new Date()
        startTime.setDate(endTime.getDate() - days)
        const uniswap_interval = (() => {
            if (days === 0 || days > 365) return 86400 // max
            if (days > 90) return 7200 // 1y
            if (days > 30) return 3600 // 3m
            if (days > 7) return 900 // 1w
            return 300 // 5m
        })()
        return getStats(
            chainId,
            coinId,
            uniswap_interval,
            Math.floor((days === Days.MAX ? BTC_FIRST_LEGER_DATE.getTime() : startTime.getTime()) / 1000),
            Math.floor(endTime.getTime() / 1000),
        )
    }
    getCoinMarketInfo(symbol: string): Promise<TrendingAPI.MarketInfo> {
        throw new Error('Method not implemented.')
    }
}
