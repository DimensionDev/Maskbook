import type BigNumber from 'bignumber.js'

export interface Team {
    teamId: number
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
    teams: TeamsInterface
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

export interface AmmOutcome extends Outcome {
    rate: BigNumber
}

export interface TeamSportsMarket {
    homeTeamId: string
    awayTeamId: string
    endTime: string
    winner: string | null
    score: string
    marketType: string
}

export interface MmaMarket {
    homeFighterId: string
    awayFighterId: string
    homeFighterName: string
    awayFighterName: string
    endTime: string
    winner: string | null
    marketType: string
}

export interface CryptoMarket {
    endTime: string
    winner: string | null
    marketType: string
}

export interface MarketInfo {
    teamSportsMarket?: TeamSportsMarket[]
    mmaMarket?: MmaMarket[]
    cryptoMarket?: CryptoMarket[]
}

export interface Market {
    address: string
    id: string
    link: string
    homeTeam?: Team
    awayTeam?: Team
    title: string
    description: string
    endDate: Date
    outcomes: Outcome[]
    sport: Sport
    sportsMarketType: SportMarketType
    shareTokens: string[]
    hasWinner: boolean
    winner?: string
    collateral: string
    swapFee: string
    ammExchange?: AmmExchange
    marketType: MarketType
    dirtyAmmExchnage?: boolean
}

export enum SportMarketType {
    HeadToHead = 0,
    Spread = 1,
    OverUnder = 2,
}

export enum MarketType {
    Sport = 0,
    Mma = 1,
    Crypto = 2,
}

export interface MarketTitle {
    title: string
    description: string
}

export interface AmmExchange {
    address: string
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
    maxProfit?: string
    tradeFees: string
    remainingShares?: string
    ratePerCash: string
    priceImpact: string
    outcomeShareTokensIn?: string[]
    maxSellAmount?: string
}
