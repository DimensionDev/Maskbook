import type Web3 from 'web3'
import { formatUnits } from '@ethersproject/units'
import { isNonNull } from '@dimensiondev/kit'
import type { TransactionReceipt } from 'web3-core'
import { createContract, TransactionEventType } from '@masknet/web3-shared-evm'
import type { AbiItem } from 'web3-utils'
import ReferralFarmsV1ABI from '@masknet/web3-contracts/abis/ReferralFarmsV1.json'

import type { Reward, ChainAddress } from '../../types'
import { parseChainAddress } from '../../helpers'
import { REFERRAL_FARMS_V1_ADDR } from '../../constants'

function validateRewardPeriods(rewards: Reward[]) {
    let isValid = true
    const arrLength = rewards.length

    rewards.forEach((reward, i) => {
        if (!(i < arrLength - 1)) return

        const current = Number.parseInt(formatUnits(reward.confirmation, 0), 10)
        const next = Number.parseInt(formatUnits(rewards[i + 1].confirmation, 0), 10)
        if (next - current > 1) {
            isValid = false
        }
    })

    return isValid
}

export async function getAccountTokenConfirmationOffset(
    web3: Web3,
    account: string,
    rewardTokenDefn: ChainAddress,
): Promise<number> {
    const referralFarmsV1Contract = createContract(web3, REFERRAL_FARMS_V1_ADDR, ReferralFarmsV1ABI as AbiItem[])
    const tokenAddress = parseChainAddress(rewardTokenDefn).address

    const offset =
        (await referralFarmsV1Contract?.methods.getAccountTokenConfirmationOffset(account, tokenAddress).call()) || 0

    return Number.parseInt(offset, 10)
}

export async function filterRewardsByAccountTokenPeriodOffset(
    web3: Web3,
    account: string,
    rewardTokenDefn: ChainAddress,
    rewards: Reward[],
): Promise<Reward[]> {
    const rewardsFiltered = (
        await Promise.allSettled(
            rewards.map(async (reward) => {
                const offset = await getAccountTokenConfirmationOffset(web3, account, rewardTokenDefn)
                if (offset < Number.parseInt(formatUnits(reward.confirmation, 0), 10)) {
                    return reward
                }
                return null
            }),
        )
    )
        .map((v) => (v.status === 'fulfilled' && v.value ? v.value : null))
        .filter(isNonNull)

    return rewardsFiltered
}

export async function harvestRewards(
    onConfirm: (txHash: string) => void,
    onStart: () => void,
    onError: (error?: string) => void,
    web3: Web3,
    account: string,
    rewards: Reward[],
    rewardTokenDefn: string,
) {
    try {
        onStart()

        const config = {
            from: account,
        }
        // filter out the periods that oracle might still need to pick up
        const rewardsFiltered = await filterRewardsByAccountTokenPeriodOffset(web3, account, rewardTokenDefn, rewards)
        const rewardsSorted = rewardsFiltered.sort(
            (rewardA, rewardB) =>
                Number.parseInt(formatUnits(rewardA.confirmation, 0), 10) -
                Number.parseInt(formatUnits(rewardB.confirmation, 0), 10),
        )

        // Check periods to ensure no periods are skipped (because skipped periods == lost funds)
        if (!validateRewardPeriods(rewardsSorted)) {
            return onError('You cannot harvest rewards because there is a missed confirmation period.')
        }

        const requests = [
            {
                rewardTokenDefn,
                entitlements: rewardsSorted.map(({ farmHash, rewardValue: value, confirmation }) => {
                    return {
                        farmHash,
                        value,
                        confirmation,
                    }
                }),
            },
        ]

        const proofs = [rewardsSorted.map((reward) => reward.proof)]

        const farmsAddr = REFERRAL_FARMS_V1_ADDR
        const farms = createContract(web3, farmsAddr, ReferralFarmsV1ABI as AbiItem[])

        const estimatedGas = await farms?.methods.harvestRewardsNoGapcheck(requests, proofs).estimateGas(config)

        await farms?.methods
            .harvestRewardsNoGapcheck(requests, proofs)
            .send({
                ...config,
                gas: estimatedGas,
            })
            .on(TransactionEventType.CONFIRMATION, (no: number, receipt: TransactionReceipt) => {
                // show Confirm dialog only at the first time
                if (no === 1) {
                    onConfirm(receipt.transactionHash)
                }
            })
            .on(TransactionEventType.ERROR, (error: Error) => {
                throw error
            })
    } catch (error: any) {
        onError(error?.message)
    }
}
