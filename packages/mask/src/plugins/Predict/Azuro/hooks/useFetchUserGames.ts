import { useAsyncRetry } from 'react-use'
import { BetStatus, ConditionStatus, UserBet, UserBetsRawData, UserFilter } from '../types'
import { useAccount, useChainId } from '@masknet/plugin-infra/web3'
import type { AsyncStateRetry } from 'react-use/lib/useAsyncRetry'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { betTypeOdd } from '../helpers/index.js'
import { fetchUserBets } from '../api/index.js'

export function useFetchUserGames(filter: UserFilter): AsyncStateRetry<UserBet[]> {
    const account = useAccount()
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)

    return useAsyncRetry(async () => {
        if (!account || !chainId) return

        const userBets = await fetchUserBets(account)

        const betsFormatted = UserBetsAdapter(userBets)

        return betsFormatted.filter((userBet: { gameInfo: { state: ConditionStatus } }) =>
            filter === UserFilter.Active.valueOf()
                ? userBet.gameInfo.state === ConditionStatus.CREATED
                : filter === UserFilter.Ended.valueOf()
                ? userBet.gameInfo.state === ConditionStatus.RESOLVED ||
                  userBet.gameInfo.state === ConditionStatus.CANCELED
                : true,
        )
    }, [filter, account, chainId])
}

export function UserBetsAdapter(bets: UserBetsRawData[]): UserBet[] {
    return bets.map((bet) => {
        const newBet = {
            ...bet,
            createdAt: Number(bet.createdAt),
            amount: Number(bet.amount),
            nftId: Number(bet.id),
            startsAt: bet.game.startDate,
            gameInfo: {
                id: bet.game.gameId,
                league: bet.game.titleLeague,
                participants: bet.game.opponents.map((opponent) => ({ name: opponent.title, image: opponent.image })),
                startsAt: bet.game.startDate,
                state: bet.status,
                country: bet.game.titleCountry,
                leagueId: 0,
                countryId: 0,
                sportTypeId: bet.game.sportTypeId,
            },
            result: Number(bet.prize),
            rate: Number(bet.odds),
            marketRegistryId: betTypeOdd[Number(bet.outcomeBet)].marketRegistryId,
            outcomeRegistryId: betTypeOdd[Number(bet.outcomeBet)].outcomeRegistryId,
            paramId: betTypeOdd[Number(bet.outcomeBet)].paramId,
            isRedeemed: bet.status === BetStatus.REDEEMED,
            conditionId: 0,
        }
        return newBet
    })
}
