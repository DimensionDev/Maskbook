import { groupBy } from 'lodash-unified'
import { defaultAbiCoder } from '@ethersproject/abi'
import { keccak256 } from 'web3-utils'

import type { ChainId, AccountRewards, Reward } from '../../types'
import { getAccountEntitlements } from './entitlements'
import { getMyRewardsHarvested, getFarmExistEvents } from './farms'
import { toChainAddressEthers, parseChainAddress } from '../../helpers'
import { supportedChainId } from '../../constants'
import { fetchERC20TokensFromTokenListsMap } from './tokenLists'
import { getFarmOraclesDiscovery } from './discovery'

function makeLeafHash(
    chainId: number,
    reward: Reward,
    rewardTokenDefn: string,
    referralFarmsAddr: string,
    confirmationsAddr: string,
) {
    return keccak256(
        defaultAbiCoder.encode(
            [
                'bytes24',
                'bytes24',
                'address',
                'bytes24',
                '(bytes32 farmHash, uint128 rewardValue, uint128 confirmation)',
            ],
            [
                toChainAddressEthers(chainId, confirmationsAddr),
                toChainAddressEthers(chainId, referralFarmsAddr),
                reward.entitlee,
                rewardTokenDefn,
                {
                    farmHash: reward.farmHash,
                    rewardValue: reward.rewardValue,
                    confirmation: reward.confirmation,
                },
            ],
        ),
    )
}

export async function getAccountRewards(account: string, chainId: ChainId): Promise<AccountRewards | undefined> {
    const entitlements = await getAccountEntitlements(account)
    const rewardsHarvested = await getMyRewardsHarvested(account, chainId)
    const farms = await getFarmExistEvents(chainId)

    const farmsMap = new Map(farms.map((farm) => [farm.farmHash, farm]))
    const rewardsHarvestedMap = new Map(
        rewardsHarvested.map((rewardHarvested) => [rewardHarvested.leafHash, rewardHarvested.value]),
    )

    // Query tokens
    const tokensMap = await fetchERC20TokensFromTokenListsMap(chainId)

    // Query addresses
    const {
        discovery: { referralFarmsV1, confirmationsV1 },
    } = await getFarmOraclesDiscovery()
    const referralFarmsAddr = referralFarmsV1.find((e) => e.chainId === supportedChainId)?.address ?? ''
    const confirmationsAddr = confirmationsV1.find((e) => e.chainId === supportedChainId)?.address ?? ''

    const rewards = entitlements?.map((entitlement) => {
        const farm = farmsMap.get(entitlement.farmHash)

        return {
            ...entitlement,
            ...farm,
            referredToken: tokensMap.get(parseChainAddress(farm?.referredTokenDefn ?? '').address),
            rewardToken: tokensMap.get(parseChainAddress(farm?.rewardTokenDefn ?? '').address),
            claimed: farm
                ? Boolean(
                      rewardsHarvestedMap.get(
                          makeLeafHash(
                              chainId,
                              entitlement,
                              farm.rewardTokenDefn,
                              referralFarmsAddr,
                              confirmationsAddr,
                          ),
                      ),
                  )
                : false,
        }
    })

    return groupBy(rewards, (reward) => reward.rewardTokenDefn)
}
