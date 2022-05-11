import { defaultAbiCoder } from '@ethersproject/abi'
import { formatUnits, parseUnits } from '@ethersproject/units'
import BigNumber from 'bignumber.js'
import type { TransactionReceipt } from 'web3-core'
import { ChainId, createContract, TransactionEventType, FungibleTokenDetailed } from '@masknet/web3-shared-evm'
import type Web3 from 'web3'
import { AbiItem, asciiToHex, padRight, toWei } from 'web3-utils'
import ReferralFarmsV1ABI from '@masknet/web3-contracts/abis/ReferralFarmsV1.json'
import ERC20ABI from '@masknet/web3-contracts/abis/ERC20.json'

import { roundValue, toChainAddressEthers, parseChainAddress } from '../../helpers'
import type { Reward, ChainAddress } from '../../types'
import { REFERRAL_FARMS_V1_ADDR } from '../../constants'

export async function runCreateERC20PairFarm(
    onStart: () => void,
    onError: (error?: string) => void,
    onConfirmed: (txHash: string) => void,
    web3: Web3,
    account: string,
    chainId: ChainId,
    rewardToken: FungibleTokenDetailed,
    referredToken: FungibleTokenDetailed,
    totalFarmReward: number,
    dailyFarmReward: number,
) {
    try {
        onStart()

        const farmsAddr = REFERRAL_FARMS_V1_ADDR
        const farms = createContract(web3, farmsAddr, ReferralFarmsV1ABI as AbiItem[])

        const referredTokenDefn = toChainAddressEthers(chainId, referredToken.address)
        const rewardTokenDefn = toChainAddressEthers(chainId, rewardToken.address)
        const rewardTokenDecimals = rewardToken.decimals
        const totalFarmRewardStr = roundValue(totalFarmReward, rewardTokenDecimals).toString()
        const dailyFarmRewardStr = roundValue(dailyFarmReward, rewardTokenDecimals).toString()
        const totalFarmRewardUint128 = parseUnits(totalFarmRewardStr, rewardTokenDecimals)

        const config = {
            from: account,
        }

        // Grant permission
        const rewardTokenInstance = createContract(web3, rewardToken.address, ERC20ABI as AbiItem[])
        const allowance = await rewardTokenInstance?.methods.allowance(account, farmsAddr).call()
        const isNeededGrantPermission = new BigNumber(allowance).isLessThan(totalFarmReward)
        if (isNeededGrantPermission) {
            const maxAllowance = new BigNumber(toWei('10000000000000', 'ether'))
            const estimatedGas = await rewardTokenInstance?.methods.approve(farmsAddr, maxAllowance).estimateGas(config)

            await rewardTokenInstance?.methods.approve(farmsAddr, maxAllowance).send({
                ...config,
                gas: estimatedGas,
            })
        }
        // Create farm
        const metaState =
            dailyFarmReward > 0
                ? [
                      // Metastate keys ideally are ascii and up to length 31 (ascii, utf8 might be less)
                      {
                          key: padRight(asciiToHex('periodReward'), 64),
                          value: defaultAbiCoder.encode(
                              ['uint128', 'int128'],
                              [parseUnits(dailyFarmRewardStr, rewardTokenDecimals), '0'],
                          ),
                      },
                  ]
                : []

        const estimatedGas2 = await farms?.methods
            .increaseReferralFarm(rewardTokenDefn, referredTokenDefn, totalFarmRewardUint128, metaState)
            .estimateGas(config)

        await farms?.methods
            .increaseReferralFarm(rewardTokenDefn, referredTokenDefn, totalFarmRewardUint128, metaState)
            .send({
                ...config,
                gas: estimatedGas2,
            })
            .on(TransactionEventType.CONFIRMATION, (no: number, receipt: TransactionReceipt) => {
                // show Confirm dialog only at the first time
                if (no === 1) {
                    onConfirmed(receipt.transactionHash)
                }
            })
            .on(TransactionEventType.ERROR, (error: Error) => {
                throw error
            })
    } catch (error: any) {
        onError()
    }
}

export async function adjustFarmRewards(
    onStart: () => void,
    onError: (error?: string) => void,
    onConfirmed: (txHash: string) => void,
    web3: Web3,
    account: string,
    chainId: ChainId,
    rewardToken: FungibleTokenDetailed,
    referredToken: FungibleTokenDetailed,
    totalFarmReward: number,
    dailyFarmReward: number,
) {
    try {
        // Increase/decrease the Daily Farm Reward and deposit Additional Farm Rewards
        if (totalFarmReward > 0) {
            return await runCreateERC20PairFarm(
                onStart,
                onError,
                onConfirmed,
                web3,
                account,
                chainId,
                rewardToken,
                referredToken,
                totalFarmReward,
                dailyFarmReward,
            )
        }

        // Increase/decrease the Daily Farm Reward
        if (dailyFarmReward > 0) {
            onStart()

            const config = {
                from: account,
            }

            const farmsAddr = REFERRAL_FARMS_V1_ADDR
            const farms = createContract(web3, farmsAddr, ReferralFarmsV1ABI as AbiItem[])
            const rewardTokenDefn = toChainAddressEthers(chainId, rewardToken.address)
            const referredTokenDefn = toChainAddressEthers(chainId, referredToken.address)
            const rewardTokenDecimals = rewardToken.decimals
            const dailyFarmRewardStr = roundValue(dailyFarmReward, rewardTokenDecimals).toString()
            const metaState = [
                {
                    key: padRight(asciiToHex('periodReward'), 64),
                    value: defaultAbiCoder.encode(
                        ['uint128', 'int128'],
                        [parseUnits(dailyFarmRewardStr, rewardTokenDecimals), '0'],
                    ),
                },
            ]
            const estimatedGas = await farms?.methods
                .configureMetastate(rewardTokenDefn, referredTokenDefn, metaState)
                .estimateGas(config)

            await farms?.methods
                .configureMetastate(rewardTokenDefn, referredTokenDefn, metaState)
                .send({
                    ...config,
                    gas: estimatedGas,
                })
                .on(TransactionEventType.CONFIRMATION, (no: number, receipt: TransactionReceipt) => {
                    // show Confirm dialog only at the first time
                    if (no === 1) {
                        onConfirmed(receipt.transactionHash)
                    }
                })
                .on(TransactionEventType.ERROR, (error: Error) => {
                    throw error
                })
        }
    } catch (error: any) {
        onError(error?.message)
    }
}

function validateRewardPeriods(rewards: Reward[]) {
    let isValid = true
    const arrLength = rewards.length

    rewards.forEach((reward, i) => {
        if (!(i < arrLength - 1)) return

        const current = Number.parseInt(formatUnits(reward.period, 0), 10)
        const next = Number.parseInt(formatUnits(rewards[i + 1].period, 0), 10)
        if (next - current > 1) {
            isValid = false
        }
    })

    return isValid
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
        const rewardsSorted = rewards.sort(
            (rewardA, rewardB) =>
                Number.parseInt(formatUnits(rewardA.period, 0), 10) -
                Number.parseInt(formatUnits(rewardB.period, 0), 10),
        )

        // Check periods to ensure no periods are skipped (because skipped periods == lost funds)
        if (!validateRewardPeriods(rewardsSorted)) {
            return onError('You cannot harvest rewards because there is a missed period.')
        }

        const requests = [
            {
                rewardTokenDefn,
                entitlements: rewardsSorted.map(({ farmHash, rewardValue: value, period }) => {
                    return {
                        farmHash,
                        value,
                        period,
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

export async function getAccountTokenPeriodOffset(
    web3: Web3,
    account: string,
    rewardTokenDefn: ChainAddress,
): Promise<number> {
    const referralFarmsV1Contract = createContract(web3, REFERRAL_FARMS_V1_ADDR, ReferralFarmsV1ABI as AbiItem[])
    const tokenAddress = parseChainAddress(rewardTokenDefn).address

    const offset =
        (await referralFarmsV1Contract?.methods.getAccountTokenPeriodOffset(account, tokenAddress).call()) || 0

    return Number.parseInt(offset, 10)
}
