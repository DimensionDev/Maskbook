import { groupBy } from 'lodash-unified'
import { defaultAbiCoder } from '@ethersproject/abi'
import { keccak256 } from 'web3-utils'

import type { ChainId, AccountRewards, Reward } from '../../types'
import { getAccountEntitlements } from './entitlements'
import { getMyRewardsHarvested, getFarmExistEvents } from './farms'
import { toChainAddressEthers, parseChainAddress } from '../../helpers'
import { REFERRAL_FARMS_V1_ADDR, CONFIRMATION_V1_ADDR } from '../../constants'
import { fetchERC20TokensFromTokenListsMap } from './tokenLists'

function makeLeafHash(chainId: number, reward: Reward, rewardTokenDefn: string) {
    return keccak256(
        defaultAbiCoder.encode(
            ['bytes24', 'bytes24', 'address', 'bytes24', '(bytes32 farmHash, uint128 rewardValue, uint128 period)'],
            [
                toChainAddressEthers(chainId, CONFIRMATION_V1_ADDR),
                toChainAddressEthers(chainId, REFERRAL_FARMS_V1_ADDR),
                reward.entitlee,
                rewardTokenDefn,
                {
                    farmHash: reward.farmHash,
                    rewardValue: reward.rewardValue,
                    period: reward.period,
                },
            ],
        ),
    )
}

export async function getAccountRewards(
    account: string,
    chainId: ChainId,
    tokenLists: string[],
): Promise<AccountRewards | undefined> {
    const entitlements = await getAccountEntitlements(account)
    const rewardsHarvested = await getMyRewardsHarvested(account, chainId)
    const farms = await getFarmExistEvents(chainId)

    const farmsMap = new Map(farms.map((farm) => [farm.farmHash, farm]))
    const rewardsHarvestedMap = new Map(
        rewardsHarvested.map((rewardHarvested) => [rewardHarvested.leafHash, rewardHarvested.value]),
    )

    // Query tokens
    const tokensMap = await fetchERC20TokensFromTokenListsMap(tokenLists, chainId)

    const rewards = entitlements.map((entitlement) => {
        const farm = farmsMap.get(entitlement.farmHash)

        return {
            ...entitlement,
            ...farm,
            referredToken: tokensMap.get(parseChainAddress(farm?.referredTokenDefn ?? '').address),
            rewardToken: tokensMap.get(parseChainAddress(farm?.rewardTokenDefn ?? '').address),
            claimed: farm
                ? Boolean(rewardsHarvestedMap.get(makeLeafHash(chainId, entitlement, farm.rewardTokenDefn)))
                : false,
        }
    })

    return groupBy(rewards, (reward) => reward.rewardTokenDefn)
}
