import type Web3 from 'web3'
import { formatUnits } from '@ethersproject/units'
import { isNonNull } from '@dimensiondev/kit'
import { EMPTY_LIST } from '@masknet/shared-base'

import type { AccountRewards, RewardTokenRewards } from '../../types'
import { getAccountTokenPeriodOffset } from './referralFarm'

export async function filterRewardsByAccountTokenPeriodOffset(
    web3: Web3,
    account: string,
    accountRewards?: AccountRewards,
): Promise<RewardTokenRewards[]> {
    if (!accountRewards || !Object.keys(accountRewards).length) return EMPTY_LIST

    const rewardsFiltered = (
        await Promise.allSettled(
            Object.entries(accountRewards).map(async ([rewardTokenDefn, rewardTokenRewards]) => {
                const offset = await getAccountTokenPeriodOffset(web3, account, rewardTokenDefn)
                return {
                    rewardTokenDefn,
                    rewardTokenRewards: rewardTokenRewards.filter((reward) => {
                        return offset < Number.parseInt(formatUnits(reward.period, 0), 10)
                    }),
                }
            }),
        )
    )
        .map((v) => (v.status === 'fulfilled' && v.value ? v.value : null))
        .filter(isNonNull)

    return rewardsFiltered
}
