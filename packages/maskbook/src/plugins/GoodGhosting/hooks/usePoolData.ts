import { useChainId, useERC20TokenContract, useGoodGhostingConstants } from '@masknet/web3-shared'
import BigNumber from 'bignumber.js'
import { useAsyncRetry } from 'react-use'
import type { AsyncStateRetry } from 'react-use/lib/useAsyncRetry'
import { DAI, WETH } from '../constants'
import { useAaveLendingPoolContract } from '../contracts/useAaveLendingPoolContract'
import { useGoodGhostingContract } from '../contracts/useGoodGhostingContract'
import { useGoodGhostingIncentiveContract } from '../contracts/useGoodGhostingIncentivesContract'
import type { GoodGhostingInfo, LendingPoolData } from '../types'

export function usePoolData(info: GoodGhostingInfo) {
    const contract = useGoodGhostingContract()
    const lendingPoolContract = useAaveLendingPoolContract(info.lendingPoolAddress)
    const adaiContract = useERC20TokenContract(info.adaiTokenAddress)
    const incentivesContract = useGoodGhostingIncentiveContract()
    const { GOOD_GHOSTING_CONTRACT_ADDRESS } = useGoodGhostingConstants()
    const chainId = useChainId()

    const asyncResult = useAsyncRetry(async () => {
        if (!contract || !lendingPoolContract || !adaiContract || !incentivesContract) return

        const [reward, currentDeposits, totalAdai, reserveData] = await Promise.all([
            incentivesContract.methods
                .getRewardsBalance([info.adaiTokenAddress], GOOD_GHOSTING_CONTRACT_ADDRESS)
                .call(),
            contract.methods.segmentDeposit(info.currentSegment).call(),
            adaiContract.methods.balanceOf(GOOD_GHOSTING_CONTRACT_ADDRESS).call(),
            lendingPoolContract.methods.getReserveData(DAI[chainId].address).call(),
        ])

        const rawADaiAPY = new BigNumber((reserveData as any).currentLiquidityRate)
        const poolAPY = rawADaiAPY.dividedBy(10 ** 27).multipliedBy(100)

        const poolEarnings = new BigNumber(totalAdai).minus(
            new BigNumber(info.totalGamePrincipal).minus(new BigNumber(currentDeposits)),
        )

        return {
            reward,
            poolAPY,
            poolEarnings,
        }
    })

    return asyncResult as AsyncStateRetry<LendingPoolData>
}

export function useGameToken() {
    const chainId = useChainId()
    return DAI[chainId]
}

export function useRewardToken() {
    const chainId = useChainId()
    return WETH[chainId]
}
