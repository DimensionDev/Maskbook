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
    result: any
    createdAt: number
    isRedeemed: boolean
    gameInfo: Pick<ConditionGameData, 'id' | 'state' | 'startsAt'> & FormattedIpfsData
}

export interface Odds {
    conditionId: number
    outcomeId: number
    outcomeRegistryId: number
    value: number
}

interface Participant {
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
