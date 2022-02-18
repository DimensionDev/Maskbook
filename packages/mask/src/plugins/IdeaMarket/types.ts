import type BigNumber from 'bignumber.js'

export interface IdeaToken {
    id: string
    name: string
    tokenId: string
    market: Market
    rank: string
    latestPricePoint: IdeaTokenPricePoint
    supply: BigNumber
    holders: number
    daiInToken: BigNumber
}

export enum Period {
    H1 = '1h',
    D1 = '1d',
    W1 = '1w',
    M1 = '1m',
    Y1 = '1y',
}

export interface IdeaTokenPricePoint {
    price: number
}

export interface Market {
    name: MarketAvailable
}

export enum MarketAvailable {
    Wikipedia = 'Wikipedia',
    Minds = 'Minds',
    Twitter = 'Twitter',
    Substack = 'Substack',
    Showtime = 'Showtime',
}

export enum IdeaTokenTab {
    STATS = 0,
    CHART = 1,
    BOUGHT_TOGETHER = 2,
}
