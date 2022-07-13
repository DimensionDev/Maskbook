import { DataProvider } from '@masknet/public-api'
import { TokenType } from '@masknet/web3-shared-base'
import type { ChainId } from '@masknet/web3-shared-evm'
import { isMirroredKeyword } from '../CoinMarketCap/helper'
import type { TrendingAPI } from '../types'
import * as BaseAPI from './base-api'
import { BTC_FIRST_LEGER_DATE, getAllCoinsByKeyword, getPriceStats as getStats } from './base-api'

export enum Days {
    MAX = 0,
    ONE_DAY = 1,
    ONE_WEEK = 7,
    ONE_MONTH = 30,
    ONE_YEAR = 365,
}

export class UniSwapAPI implements TrendingAPI.Provider<ChainId> {
    getPriceStats(
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
    async getCoinTrending(chainId: ChainId, id: string, currency: TrendingAPI.Currency): Promise<TrendingAPI.Trending> {
        const { token, marketInfo, tickersInfo } = await BaseAPI.getCoinInfo(chainId, id)
        return {
            currency,
            dataProvider: DataProvider.UNISWAP_INFO,
            market: marketInfo,
            coin: {
                id,
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

    getCoins(): Promise<TrendingAPI.Coin[]> {
        return Promise.resolve([])
    }

    getCurrencies(): Promise<TrendingAPI.Currency[]> {
        return Promise.resolve([
            {
                id: 'usd',
                name: 'USD',
                symbol: '$',
                description: 'Unite State Dollar',
            },
        ])
    }

    getCoinsByKeyword(chainId: ChainId, keyword: string): Promise<TrendingAPI.Coin[]> {
        return getAllCoinsByKeyword(chainId, keyword)
    }
}
