import { groupBy } from 'lodash-unified'
import { defaultAbiCoder } from '@ethersproject/abi'
import { keccak256 } from 'web3-utils'

import type { ChainId, AccountRewards, Reward } from '../../types'
import { getAccountEntitlements } from './entitlements'
import { getMyRewardsHarvested, getAllFarms } from './farms'
import { toChainAddressEthers } from '../../helpers'
import { REFERRAL_FARMS_V1_ADDR, CONFIRMATION_V1_ADDR } from '../../constants'

function makeLeafHash(chainId: number, reward: Reward, rewardTokenDefn: string) {
    return keccak256(
        defaultAbiCoder.encode(
            [
                'bytes24',
                'bytes24',
                'address',
                '(bytes32 farmHash, uint128 rewardValue, bytes24 rewardTokenDefn, uint64 effectNonce)',
            ],
            [
                toChainAddressEthers(chainId, CONFIRMATION_V1_ADDR),
                toChainAddressEthers(chainId, REFERRAL_FARMS_V1_ADDR),
                reward.entitlee,
                {
                    farmHash: reward.farmHash,
                    rewardValue: reward.rewardValue,
                    rewardTokenDefn: rewardTokenDefn,
                    effectNonce: reward.nonce,
                },
            ],
        ),
    )
}

export async function getAccountRewards(account: string, chainId: ChainId): Promise<AccountRewards | undefined> {
    const entitlements = await getAccountEntitlements(account)
    const rewardsHarvested = await getMyRewardsHarvested(account, chainId)
    const farms = await getAllFarms(chainId)

    const farmsMap = new Map(farms.map((farm) => [farm.farmHash, farm]))
    const rewardsHarvestedMap = new Map(
        rewardsHarvested.map((rewardHarvested) => [rewardHarvested.leafHash, rewardHarvested.value]),
    )

    const rewards = entitlements.map((entitlement) => {
        const farm = farmsMap.get(entitlement.farmHash)

        return {
            ...entitlement,
            rewardTokenDefn: farm?.rewardTokenDefn,
            referredTokenDefn: farm?.referredTokenDefn,
            claimed: farm
                ? Boolean(rewardsHarvestedMap.get(makeLeafHash(chainId, entitlement, farm.rewardTokenDefn)))
                : false,
        }
    })

    return groupBy(rewards, (reward) => reward.rewardTokenDefn)
}
