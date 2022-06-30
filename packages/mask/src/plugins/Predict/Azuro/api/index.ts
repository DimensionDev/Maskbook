import { calculateActualOdds, fetchGames, fetchUserBets } from '@azuro-protocol/sdk'
import type { ChainId } from '@masknet/web3-shared-evm'
import { configureAzuroSDK } from '../helpers/configureAzuroSDK'

export async function fetchMyBets(account: string, chainId: ChainId) {
    await configureAzuroSDK(chainId)

    const bets = await fetchUserBets({ account })
    return bets
}

export async function fetchEvents(chainId: ChainId) {
    await configureAzuroSDK(chainId)

    const events = await fetchGames({
        filters: {
            resolved: false,
            canceled: false,
        },
    })

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
