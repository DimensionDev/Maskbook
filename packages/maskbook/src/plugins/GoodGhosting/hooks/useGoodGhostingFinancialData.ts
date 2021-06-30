import { useERC20TokenContract, useGoodGhostingConstants, useTokenConstants } from '@masknet/web3-shared'
import BigNumber from 'bignumber.js'
import { useAsyncRetry } from 'react-use'
import { useAaveLendingPoolContract } from '../contracts/useAaveLendingPoolContract'
import { useGoodGhostingContract } from '../contracts/useGoodGhostingContract'
import { useGoodGhostingIncentiveContract } from '../contracts/useGoodGhostingIncentivesContract'
import type { GoodGhostingInfo } from '../types'

export function useGoodGhostingFinancialData(info: GoodGhostingInfo) {
    const contract = useGoodGhostingContract()
    const lendingPoolContract = useAaveLendingPoolContract(info.lendingPoolAddress)
    const adaiContract = useERC20TokenContract(info.adaiTokenAddress)
    const incentivesContract = useGoodGhostingIncentiveContract()
    const { DAI_ADDRESS } = useTokenConstants()
    const { GOOD_GHOSTING_CONTRACT_ADDRESS } = useGoodGhostingConstants()

    const asyncResult = useAsyncRetry(async () => {
        if (!contract || !lendingPoolContract || !adaiContract || !incentivesContract) return

        const [reward, currentDeposits, totalAdai, reserveData] = await Promise.all([
            incentivesContract.methods
                .getRewardsBalance([info.adaiTokenAddress], GOOD_GHOSTING_CONTRACT_ADDRESS)
                .call(),
            contract.methods.segmentDeposit(info.currentSegment).call(),
            adaiContract.methods.balanceOf(GOOD_GHOSTING_CONTRACT_ADDRESS).call(),
            lendingPoolContract.methods.getReserveData(DAI_ADDRESS).call(),
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

    return asyncResult
}
