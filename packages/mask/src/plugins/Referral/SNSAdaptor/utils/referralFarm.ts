import { defaultAbiCoder } from '@ethersproject/abi'
import { parseUnits } from '@ethersproject/units'
import BigNumber from 'bignumber.js'
import { ChainId, createContract, encodeContractTransaction } from '@masknet/web3-shared-evm'
import type Web3 from 'web3'
import { AbiItem, asciiToHex, padRight, toWei } from 'web3-utils'
import ReferralFarmsV1ABI from '@masknet/web3-contracts/abis/ReferralFarmsV1.json'
import ERC20ABI from '@masknet/web3-contracts/abis/ERC20.json'

import { roundValue, toChainAddressEthers } from '../../helpers'
import { ReferralRPC } from '../../messages'
import type { FungibleTokenDetailed } from '../../types'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import type { Web3Helper } from '@masknet/plugin-infra/web3'

async function resolveReferralFarmsV1Address() {
    try {
        return await ReferralRPC.getReferralFarmsV1Address()
    } catch (error) {
        throw new Error('Referral farms address cannot be retrieved at the moment. Please try later.')
    }
}

export async function runCreateERC20PairFarm(
    onStart: () => void,
    onConfirmed: (txHash: string) => void,
    web3: Web3,
    connection: Web3Helper.Web3Connection<NetworkPluginID.PLUGIN_EVM>,
    account: string,
    chainId: ChainId,
    rewardToken: FungibleTokenDetailed,
    referredToken: FungibleTokenDetailed,
    totalFarmReward: number,
    dailyFarmReward: number,
) {
    onStart()
    const farmsAddr = await resolveReferralFarmsV1Address()
    if (!farmsAddr) return

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
    const rewardTokenContract = createContract(web3, rewardToken.address, ERC20ABI as AbiItem[])
    const allowance = await rewardTokenContract?.methods.allowance(account, farmsAddr).call()
    const isNeededGrantPermission = new BigNumber(allowance).isLessThan(totalFarmReward)
    if (isNeededGrantPermission && rewardTokenContract) {
        const maxAllowance = new BigNumber(toWei('10000000000000', 'ether'))

        const approveTx = await encodeContractTransaction(
            rewardTokenContract,
            rewardTokenContract.methods.approve(farmsAddr, maxAllowance),
            config,
        )
        await connection.sendTransaction(approveTx)
    }
    // Create farm
    const metaState =
        dailyFarmReward > 0
            ? [
                  // Metastate keys ideally are ascii and up to length 31 (ascii, utf8 might be less)
                  {
                      key: padRight(asciiToHex('confirmationReward'), 64),
                      value: defaultAbiCoder.encode(
                          ['uint128', 'uint128'],
                          [parseUnits(dailyFarmRewardStr, rewardTokenDecimals), '0'],
                      ),
                  },
              ]
            : []

    if (!farms) return
    const tx = await encodeContractTransaction(
        farms,
        farms.methods.increaseReferralFarm(rewardTokenDefn, referredTokenDefn, totalFarmRewardUint128, metaState),
        config,
    )
    const hash = await connection.sendTransaction(tx)
    onConfirmed(hash)
    return hash
}

export async function adjustFarmRewards(
    onStart: () => void,
    onConfirmed: (txHash: string) => void,
    web3: Web3,
    connection: Web3Helper.Web3Connection<NetworkPluginID.PLUGIN_EVM>,
    account: string,
    chainId: ChainId,
    rewardToken: FungibleTokenDetailed,
    referredToken: FungibleTokenDetailed,
    totalFarmReward: number,
    dailyFarmReward: number,
) {
    // Increase/decrease the Daily Farm Reward and deposit Additional Farm Rewards
    if (totalFarmReward > 0) {
        return runCreateERC20PairFarm(
            onStart,
            onConfirmed,
            web3,
            connection,
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

        const farmsAddr = await resolveReferralFarmsV1Address()
        if (!farmsAddr) return

        const farms = createContract(web3, farmsAddr, ReferralFarmsV1ABI as AbiItem[])
        const rewardTokenDefn = toChainAddressEthers(chainId, rewardToken.address)
        const referredTokenDefn = toChainAddressEthers(chainId, referredToken.address)
        const rewardTokenDecimals = rewardToken.decimals
        const dailyFarmRewardStr = roundValue(dailyFarmReward, rewardTokenDecimals).toString()
        const metaState = [
            {
                key: padRight(asciiToHex('confirmationReward'), 64),
                value: defaultAbiCoder.encode(
                    ['uint128', 'uint128'],
                    [parseUnits(dailyFarmRewardStr, rewardTokenDecimals), '0'],
                ),
            },
        ]

        if (!farms) return
        const tx = await encodeContractTransaction(
            farms,
            farms.methods.configureMetastate(rewardTokenDefn, referredTokenDefn, metaState),
            config,
        )
        const hash = await connection.sendTransaction(tx)
        onConfirmed(hash)
        return hash
    }
    return
}
