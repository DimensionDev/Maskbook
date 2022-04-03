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
    dayChange: number
    twitter?: TwitterIdeaToken
}

export interface TwitterIdeaToken {
    id: string
    name: string
    profile_image_url: string
    username: string
}

export interface UserIdeaTokenBalance {
    id: string
    token: IdeaToken
    holder: string
    amount: BigNumber
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
    marketID: number
}

export enum MarketAvailable {
    Wikipedia = 'Wikipedia',
    Minds = 'Minds',
    Twitter = 'Twitter',
    Substack = 'Substack',
    Showtime = 'Showtime',
    Url = 'URL',
}

export enum IdeaTokenTab {
    STATS = 0,
    CHART = 1,
    BOUGHT_TOGETHER = 2,
}
