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
    twitter?: TwitterLookUp
}

export interface TwitterLookUp {
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

export interface IdeaTokenPricePoint {
    price: string
}

export interface Market {
    id: string
    name: string
    marketID: number
}

export enum Markets {
    Twitter = 1,
}

export enum IdeaTokenTab {
    STATS = 0,
    CHART = 1,
    BOUGHT_TOGETHER = 2,
}
