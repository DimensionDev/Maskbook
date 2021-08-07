import type BigNumber from 'bignumber.js'

export interface Team {
    team_id: number
    name: string
    mascot: string
    abbreviation: string
    record?: string
    sportId: string
}

export interface TeamsInterface {
    [key: string]: Team
}

export interface Sport {
    sportId: string
    name: string
    categories: string[]
}

export interface SportsInterface {
    [key: string]: Sport
}

export interface Outcome {
    id: number
    name: string
    symbol: string
    isInvalid: boolean
    isWinner: boolean
    isFinalNumerator: boolean
    shareToken: string
}

export interface AMMOutcome extends Outcome {
    rate: BigNumber
}

export interface Market {
    address: string
    id: string
    link: string
    homeTeam: Team
    awayTeam: Team
    title: string
    description: string
    endDate: Date
    outcomes: Outcome[]
    sport: Sport
    sportsMarketType: SportMarketType
    shareTokens: string[]
    hasWinner: boolean
    winner?: string
    value0: string
    collateral: string
    swapFee: string
    ammExchange?: AMMExchange
}

export enum SportMarketType {
    HeadToHead,
    Spread,
    OverUnder,
}

export interface SportTitles {
    title: string
    description: string
}

export interface AMMExchange {
    totalVolume: BigNumber
    volume24hr: BigNumber
    totalLiquidity: BigNumber
    liquidity: Liquidity[]
    trades: Trade[]
    shareFactor: string
    balances: string[]
    weights: string[]
}

export interface Liquidity {
    collateral: BigNumber
}

export interface Trade {
    outcome: number
    collateral: BigNumber
    timestamp: number
}

export interface EstimateTradeResult {
    averagePrice: string
    outputValue: string
    maxProfit: string
    tradeFees: string
    remainingShares?: string
    ratePerCash: string
    priceImpact: string
    outcomeShareTokensIn?: string[]
    maxSellAmount?: string
}
