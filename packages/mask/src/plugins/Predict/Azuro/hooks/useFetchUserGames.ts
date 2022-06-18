import { useAsyncRetry } from 'react-use'
import { UserBet, UserFilter } from '../types'
import { useAccount, useChainId } from '@masknet/plugin-infra/web3'
import type { AsyncStateRetry } from 'react-use/lib/useAsyncRetry'
import { fetchMyBets } from '../api'
import type { ChainId } from '@masknet/web3-shared-evm'

export function useFetchUserGames(filter: UserFilter): AsyncStateRetry<UserBet[]> {
    const account = useAccount()
    const chainId = useChainId()

    return useAsyncRetry(async () => {
        const userBets = await fetchMyBets(account, chainId as ChainId)

        return userBets.filter((userBet) =>
            filter === UserFilter.Active.valueOf()
                ? userBet.gameInfo.state === 0
                : filter === UserFilter.Ended.valueOf()
                ? userBet.gameInfo.state === 1 || userBet.gameInfo.state === 2
                : true,
        )
    }, [filter, account, fetchMyBets])
}
