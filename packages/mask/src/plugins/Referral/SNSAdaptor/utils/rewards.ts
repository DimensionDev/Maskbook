import type Web3 from 'web3'
import { isNonNull } from '@dimensiondev/kit'
import type { TransactionReceipt } from 'web3-core'
import { createContract, TransactionEventType } from '@masknet/web3-shared-evm'
import type { AbiItem } from 'web3-utils'
import ReferralFarmsV1ABI from '@masknet/web3-contracts/abis/ReferralFarmsV1.json'

import type { Reward, ChainAddress } from '../../types'
import { parseChainAddress, valueToNumber } from '../../helpers'
import { ReferralRPC } from '../../messages'

function validateRewardPeriods(rewards: Reward[]) {
    let isValid = true
    const arrLength = rewards.length

    rewards.forEach((reward, i) => {
        if (!(i < arrLength - 1)) return

        const current = valueToNumber(reward.confirmation)
        const next = valueToNumber(rewards[i + 1].confirmation)
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
    farmsAddr: string,
): Promise<number> {
    const referralFarmsV1Contract = createContract(web3, farmsAddr, ReferralFarmsV1ABI as AbiItem[])
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
    farmsAddr: string,
): Promise<Reward[]> {
    const rewardsFiltered = (
        await Promise.allSettled(
            rewards.map(async (reward) => {
                const offset = await getAccountTokenConfirmationOffset(web3, account, rewardTokenDefn, farmsAddr)
                if (offset < valueToNumber(reward.confirmation)) {
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

async function resolveReferralFarmsV1Address(onError: (error?: string) => void) {
    try {
        return await ReferralRPC.getReferralFarmsV1Address()
    } catch (error) {
        onError('Referral farms address cannot be retrieved at the moment. Please try later.')
        return undefined
    }
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

        const farmsAddr = await resolveReferralFarmsV1Address(onError)
        if (!farmsAddr) return

        // filter out the periods that oracle might still need to pick up
        const rewardsFiltered = await filterRewardsByAccountTokenPeriodOffset(
            web3,
            account,
            rewardTokenDefn,
            rewards,
            farmsAddr,
        )
        const rewardsSorted = rewardsFiltered.sort(
            (rewardA, rewardB) => valueToNumber(rewardA.confirmation) - valueToNumber(rewardB.confirmation),
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

        const farms = createContract(web3, farmsAddr, ReferralFarmsV1ABI as AbiItem[])

        const estimatedGas = await farms?.methods.harvestRewardsNoGapcheck(requests, proofs).estimateGas(config)

        return new Promise(async (resolve, reject) => {
            farms?.methods
                .harvestRewardsNoGapcheck(requests, proofs)
                .send({
                    ...config,
                    gas: estimatedGas,
                })
                .on(TransactionEventType.CONFIRMATION, (no: number, receipt: TransactionReceipt) => {
                    resolve(receipt.transactionHash)
                })
                .on(TransactionEventType.ERROR, (error: Error) => {
                    reject(error)
                })
        })
    } catch (error: any) {
        onError(error?.message)
    }
}
