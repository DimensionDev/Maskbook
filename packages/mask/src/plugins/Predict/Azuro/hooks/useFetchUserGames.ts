import { useAsyncRetry } from 'react-use'
import { ConditionStatus, UserBet, UserFilter } from '../types'
import { useAccount, useChainId } from '@masknet/plugin-infra/web3'
import type { AsyncStateRetry } from 'react-use/lib/useAsyncRetry'
import { fetchMyBets } from '../api'
import { NetworkPluginID } from '@masknet/web3-shared-base'

export function useFetchUserGames(filter: UserFilter): AsyncStateRetry<UserBet[]> {
    const account = useAccount()
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)

    return useAsyncRetry(async () => {
        const userBets = await fetchMyBets(account, chainId)

        return userBets.filter((userBet) =>
            filter === UserFilter.Active.valueOf()
                ? userBet.gameInfo.state === ConditionStatus.CREATED
                : filter === UserFilter.Ended.valueOf()
                ? userBet.gameInfo.state === ConditionStatus.RESOLVED ||
                  userBet.gameInfo.state === ConditionStatus.CANCELED
                : true,
        )
    }, [filter, account])
}
