import { defaultAbiCoder } from '@ethersproject/abi'
import { parseUnits } from '@ethersproject/units'
import BigNumber from 'bignumber.js'
import type { TransactionReceipt } from 'web3-core'
import { ChainId, createContract, TransactionEventType, FungibleTokenDetailed } from '@masknet/web3-shared-evm'
import type Web3 from 'web3'
import { AbiItem, asciiToHex, padRight, toWei } from 'web3-utils'

import { roundValue, toChainAddressEthers } from '../../helpers'
import type { EntitlementLog } from '../../types'
import { ERC20_ABI, REFERRAL_FARMS_V1_ABI } from './abis'
import { REFERRAL_FARMS_V1_ADDR } from '../../constants'

export async function runCreateERC20PairFarm(
    onStart: (type: boolean) => void,
    onError: (error?: string) => void,
    onTransactionHash: (type: string) => void,
    web3: Web3,
    account: string,
    chainId: ChainId,
    rewardToken: FungibleTokenDetailed,
    referredToken: FungibleTokenDetailed,
    totalFarmReward: number,
    dailyFarmReward: number,
) {
    try {
        onStart(true)
        let tx: any
        const referredTokenDefn = toChainAddressEthers(chainId, referredToken.address)
        const rewardTokenDefn = toChainAddressEthers(chainId, rewardToken.address)
        const farmsAddr = REFERRAL_FARMS_V1_ADDR
        const farms = createContract(web3, farmsAddr, REFERRAL_FARMS_V1_ABI as AbiItem[])

        const rewardTokenDecimals = rewardToken.decimals
        const totalFarmRewardStr = roundValue(totalFarmReward, rewardTokenDecimals).toString()
        const dailyFarmRewardStr = roundValue(dailyFarmReward, rewardTokenDecimals).toString()
        const totalFarmRewardUint128 = parseUnits(totalFarmRewardStr, rewardTokenDecimals)

        const config = {
            from: account,
        }

        // Grant permission
        const rewardTokenInstance = createContract(web3, rewardToken.address, ERC20_ABI as AbiItem[])
        const allowance = await rewardTokenInstance?.methods.allowance(account, farmsAddr).call()
        const isNeededGrantPermission = new BigNumber(allowance).isLessThan(totalFarmReward)
        if (isNeededGrantPermission) {
            const maxAllowance = new BigNumber(toWei('10000000000000', 'ether'))
            const estimatedGas = await rewardTokenInstance?.methods.approve(farmsAddr, maxAllowance).estimateGas(config)

            tx = await rewardTokenInstance?.methods.approve(farmsAddr, maxAllowance).send({
                ...config,
                gas: estimatedGas,
            })
        }
        const metastate =
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
            .increaseReferralFarm(rewardTokenDefn, referredTokenDefn, totalFarmRewardUint128, metastate)
            .estimateGas(config)

        tx = await farms?.methods
            .increaseReferralFarm(rewardTokenDefn, referredTokenDefn, totalFarmRewardUint128, metastate)
            .send({
                ...config,
                gas: estimatedGas2,
            })
            .on(TransactionEventType.RECEIPT, () => {
                onStart(true)
            })
            .on(TransactionEventType.CONFIRMATION, (no: number, receipt: TransactionReceipt) => {
                // show Confirm dialog only at the first time
                if (no === 1) {
                    onTransactionHash(receipt.transactionHash)
                }
            })
            .on(TransactionEventType.ERROR, (error: Error) => {
                onStart(false)
            })
    } catch (error: any) {
        onStart(false)
        onError()
    }
}
export async function adjustFarmRewards(
    onStart: (type: boolean) => void,
    onError: (error?: string) => void,
    onTransactionHash: (type: string) => void,
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
                onTransactionHash,
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
            onStart(true)

            const config = {
                from: account,
            }

            const farmsAddr = REFERRAL_FARMS_V1_ADDR
            const farms = createContract(web3, farmsAddr, REFERRAL_FARMS_V1_ABI as AbiItem[])
            const rewardTokenDefn = toChainAddressEthers(chainId, rewardToken.address)
            const referredTokenDefn = toChainAddressEthers(chainId, referredToken.address)
            const rewardTokenDecimals = rewardToken.decimals
            const dailyFarmRewardStr = roundValue(dailyFarmReward, rewardTokenDecimals).toString()
            const metastate = [
                {
                    key: padRight(asciiToHex('periodReward'), 64),
                    value: defaultAbiCoder.encode(
                        ['uint128', 'int128'],
                        [parseUnits(dailyFarmRewardStr, rewardTokenDecimals), '0'],
                    ),
                },
            ]
            const estimatedGas = await farms?.methods
                .configureMetastate(rewardTokenDefn, referredTokenDefn, metastate)
                .estimateGas(config)

            const tx = await farms?.methods
                .configureMetastate(rewardTokenDefn, referredTokenDefn, metastate)
                .send({
                    ...config,
                    gas: estimatedGas,
                })
                .on(TransactionEventType.RECEIPT, (onSucceed: () => void) => {
                    onStart(true)
                })
                .on(TransactionEventType.CONFIRMATION, (no: number, receipt: TransactionReceipt) => {
                    // show Confirm dialog only at the first time
                    if (no === 1) {
                        onTransactionHash(receipt.transactionHash)
                    }
                })
                .on(TransactionEventType.ERROR, (error: Error) => {
                    onStart(false)
                })
        }
    } catch (error: any) {
        onError(error?.message)
        onStart(false)
    }
}

export async function harvestRewards(
    onConfirm: (txHash: string) => void,
    onStart: () => void,
    onError: (error?: string) => void,
    web3: Web3,
    account: string,
    chainId: ChainId,
    entitlements: EntitlementLog[],
    rewardTokenDefn: string,
) {
    try {
        onStart()

        const config = {
            from: account,
        }
        const entitlementsSorted = entitlements.sort(
            (entitlementA, entitlementB) => entitlementA.args.nonce.toNumber() - entitlementB.args.nonce.toNumber(),
        )

        const requests = entitlementsSorted.map((entitlement) => {
            return {
                farmHash: entitlement.args.farmHash,
                value: entitlement.args.rewardValue,
                rewardTokenDefn,
                effectNonce: entitlement.args.nonce,
            }
        })

        const proofs = entitlementsSorted.map((entitlement) => entitlement.args.proof)

        const farmsAddr = REFERRAL_FARMS_V1_ADDR
        const farms = createContract(web3, farmsAddr, REFERRAL_FARMS_V1_ABI as AbiItem[])

        const estimatedGas = await farms?.methods.harvestRewards(requests, proofs, []).estimateGas(config)

        const tx = await farms?.methods
            .harvestRewards(requests, proofs, [])
            .send({
                ...config,
                gas: estimatedGas,
            })
            .on(TransactionEventType.RECEIPT, (onSucceed: () => void) => {
                onStart()
            })
            .on(TransactionEventType.CONFIRMATION, (no: number, receipt: TransactionReceipt) => {
                // show Confirm dialog only at the first time
                if (no === 1) {
                    onConfirm(receipt.transactionHash)
                }
            })
            .on(TransactionEventType.ERROR, (error: Error) => {})
    } catch (error: any) {
        onError(error?.message)
    }
}
