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

export interface ContractAdresses {
    core: string
    lp: string
    bet: string
    token: string
}
