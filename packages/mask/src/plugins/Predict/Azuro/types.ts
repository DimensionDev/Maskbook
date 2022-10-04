import type { ConditionGameData } from '@azuro-protocol/sdk/lib/api/fetchConditions'
import type { FormattedIpfsData } from '@azuro-protocol/sdk/lib/api/fetchGameIpfsData'

export enum UserFilter {
    All = 'all',
    Active = 'active',
    Ended = 'ended',
}

export enum Sport {
    Football = 'Football',
    Dota2 = 'Dota 2',
}

export interface UserBet {
    nftId: number
    conditionId: number
    paramId: number
    outcomeRegistryId: number
    marketRegistryId: number
    rate: number
    amount: number
    result: number
    createdAt: number
    isRedeemed: boolean
    gameInfo: Pick<ConditionGameData, 'id' | 'state' | 'startsAt'> & FormattedIpfsData
}
export interface OddsByConditions {
    [key: number]: number[]
}

export interface Odds {
    outcomesRegistryId: number[]
    conditionId: number
    outcomeId: number
    outcomeRegistryId: number
    paramId: number
    value: number
}

export interface Outcome {
    outcomesRegistryId: number[]
    conditionId: number
    outcomeId: number
    outcomeRegistryId: number
    paramId: number
    value: number
}

export interface Game {
    participants: Participant[]
    marketRegistryId: number
}

export interface Participant {
    name: string
    image: string
}

export interface ContractAddresses {
    core: string
    lp: string
    bet: string
    token: string
}

export enum OutcomesWithParam {
    Seven = 7,
    Nine = 9,
    Ten = 10,
    Eleven = 11,
    Twelve = 12,
    Thirteen = 13,
    Fourteen = 14,
}

export enum ConditionStatus {
    CREATED = 0,
    RESOLVED = 1,
    CANCELED = 2,
}

export enum BetStatus {
    CREATED = 0,
    RESOLVED = 1,
    REDEEMED = 3,
}

export enum Markets {
    FullTimeResult = 1,
    DoubleChance = 2,
    Handicap = 3,
    TotalGoals = 4,
    IndividualTotal1 = 5,
    IndividualTotal2 = 6,
    ScoredGoal = 8,
    BothTeamsToScore = 9,
    CorrectScore = 10,
    TotalEven = 14,
    HTFT = 17,
    EuropeanHandicap3w = 18,
    WinnerOfMatch = 19,
    WinnerOf1stMap = 20,
    WinnerOf2ndMap = 21,
}

export interface EventsFormatted {
    gameId: number
    conditions: ConditionRaw[]
    marketRegistryId: number
}

export type Event = Omit<EventsFormatted, 'conditions'> & { conditions: Condition[] } & Games

export interface GamesRaw extends Omit<Games, 'participants'> {
    opponents: Array<{ title: string; image: string }>
}

export interface Games {
    countryId: number
    leagueId: number
    leagueSlug: string
    participants: Participant[]
    sportTypeId: number
    startDate: number
    status: number
    titleCountry: string
    titleLeague: string
}

export interface GameData {
    conditionsByMarket: ConditionsByMarket[]
    gameId: number
    participants: { name: string; image: string }
    sportTypeId: number
    startDate: number
}

export interface League {
    count: number
    countryId: number
    games: GameData[]
    leagueId: number
    leagueSlug: string
    sportTypeId: number
    titleCountry: string
    titleLeague: string
}

export interface ConditionsByMarket {
    conditions: ConditionRaw[]
    marketRegistryId: number
}

interface ConditionRaw {
    id: number
    outcomes: number[]
    outcomesRegistryId: number[]
}

export interface Condition extends ConditionRaw {
    odds: number[]
}

export interface RawEvents {
    count: number
    countryLeagues: Array<{
        count: number
        countryId: number
        games: Array<{
            conditionsByMarket: ConditionsByMarket[]
            gameId: number
            participants: Participant[]
            sportTypeId: number
            startDate: number
        }>
        leagueId: number
        leagueSlug: string
        sportTypeId: number
        titleCountry: string
        titleLeague: string
    }>
    sportTypeId: number
}

export interface UserBetsRawData {
    [x: string]: any
    gameInfo: any
    prize: string
    isFreebet: boolean
    txHash: string
    amount: string
    odds: string
    id: string
    createdAt: string
    outcomeBet: string
    game: {
        sportTypeId: number
        titleCountry: string
        leagueSlug: string
        titleLeague: string
        gameId: number
        opponents: Array<{
            title: string
            image: string
        }>
        startDate: number
        status: number
    }
    status: number
    cleanPrize: string
}
