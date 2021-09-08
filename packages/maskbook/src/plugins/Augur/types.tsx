import type { ERC20TokenDetailed } from '@masknet/web3-shared'
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

export enum SportType {
    NFL = '2',
    MLB = '3',
    NBA = '4',
    NHL = '6',
    MMA = '7',
}

export const NAMING_TEAM = {
    HOME_TEAM: 'HOME_TEAM',
    AWAY_TEAM: 'AWAY_TEAM',
    FAV_TEAM: 'FAV_TEAM',
    UNDERDOG_TEAM: 'UNDERDOG_TEAM',
}
export const NAMING_LINE = {
    SPREAD_LINE: 'SPREAD_LINE',
    OVER_UNDER_LINE: 'OVER_UNDER_LINE',
}

export const MMA_MARKET_TYPE = {
    MONEY_LINE: 0,
    SPREAD: 1, // TODO: no spread markets for MMA when real market factory gets created
    OVER_UNDER: 1,
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
    overUnderTotal: string
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
    dirtyAmmExchange?: boolean
    initialOdds: string[]
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
    lpToken?: ERC20TokenDetailed
    totalSupply?: string
}

export interface Liquidity {
    collateral: BigNumber
}

export interface Trade {
    outcome: number
    price?: number
    collateral?: BigNumber
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

export interface LpAmount {
    amount: string
    outcomeId: number
    hide: boolean
}

export enum LiquidityActionType {
    Add = 'add',
    Create = 'create',
    Remove = 'remove',
}

export interface LiquidityBreakdown {
    amount?: string
    minAmounts?: LpAmount[]
    poolPct?: string
    lpTokens?: string
    cashAmount?: string
    type: LiquidityActionType
}

export enum Period {
    H24 = '24hr',
    D7 = '7d',
    D30 = '30d',
    ALL = 'All Time',
}

export type Stat = [number | string, number]
