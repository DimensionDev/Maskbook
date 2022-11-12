import { calculateActualOdds } from '@azuro-protocol/sdk'
import type { ChainId } from '@masknet/web3-shared-evm'
import { configureAzuroSDK } from '../helpers/configureAzuroSDK'
import type { GamesRaw, OddsByConditions, RawEvents, UserBetsRawData } from '../types.js'

export async function fetchOddsByConditions(conditionIds: number[]): Promise<OddsByConditions> {
    const oddsData = await fetch('https://api.bookmaker.xyz/odds', {
        headers: {
            'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({ conditionIds }),
    })

    const oddsByConditions = (await oddsData.json()).data
    return oddsByConditions
}

export async function fetchGamesByIds(gameIds: number[]): Promise<GamesRaw[]> {
    const response2 = await fetch('https://api.bookmaker.xyz/games/find', {
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({ gameIds }),
    })

    const games = (await response2.json()).data
    return games
}

export async function fetchGames(): Promise<RawEvents[]> {
    const response = await fetch('https://api.bookmaker.xyz/games', {
        method: 'POST',
    })
    const data = await response.json()
    const events = data.data

    return events
}

interface CalculateOddsProps {
    chainId: ChainId
    conditionId: number
    outcomeId: number
    betAmount: number
}

export async function calculateActualRate({
    chainId,
    conditionId,
    outcomeId,
    betAmount,
}: CalculateOddsProps): Promise<number> {
    configureAzuroSDK(chainId)

    return calculateActualOdds({
        conditionId,
        outcomeId,
        betAmount,
    })
}

export async function fetchUserBets(account: string): Promise<UserBetsRawData[]> {
    const response = await fetch('https://api.bookmaker.xyz/bets/' + account)
    const data = await response.json()
    const bets = data.data

    return bets
}
