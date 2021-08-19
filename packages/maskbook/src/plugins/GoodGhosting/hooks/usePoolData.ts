import { useChainId, useERC20TokenContract } from '@masknet/web3-shared'
import BigNumber from 'bignumber.js'
import { useState } from 'react'
import { useAsyncRetry } from 'react-use'
import type { AsyncStateRetry } from 'react-use/lib/useAsyncRetry'
import { DAI, WETH } from '../constants'
import { useAaveLendingPoolContract } from '../contracts/useAaveLendingPoolContract'
import { useGoodGhostingContract } from '../contracts/useGoodGhostingContract'
import { useGoodGhostingIncentiveContract } from '../contracts/useGoodGhostingIncentivesContract'
import type { GoodGhostingInfo, LendingPoolData } from '../types'

export function usePoolData(info: GoodGhostingInfo) {
    const contract = useGoodGhostingContract(info.contractAddress)
    const lendingPoolContract = useAaveLendingPoolContract(info.lendingPoolAddress)
    const adaiContract = useERC20TokenContract(info.adaiTokenAddress)
    const incentivesContract = useGoodGhostingIncentiveContract()
    const chainId = useChainId()
    const [currentData, setCurrentData] = useState<LendingPoolData>()

    const asyncResult = useAsyncRetry(async () => {
        if (!contract || !lendingPoolContract || !adaiContract || !incentivesContract) return

        const [reward, totalAdai, reserveData] = await Promise.all([
            incentivesContract.methods.getRewardsBalance([info.adaiTokenAddress], info.contractAddress).call(),
            adaiContract.methods.balanceOf(info.contractAddress).call(),
            lendingPoolContract.methods.getReserveData(DAI[chainId].address).call(),
        ])

        const rawADaiAPY = new BigNumber((reserveData as any).currentLiquidityRate)
        const poolAPY = rawADaiAPY.dividedBy(10 ** 27).multipliedBy(100)

        const poolEarnings = info.gameHasEnded
            ? new BigNumber(info.totalGameInterest)
            : new BigNumber(totalAdai).minus(info.totalGamePrincipal)

        const data: LendingPoolData = {
            reward,
            poolAPY,
            poolEarnings,
        }
        setCurrentData(data)
        return data
    }, [info.gameHasEnded, info.totalGameInterest, info.totalGamePrincipal])

    return {
        ...asyncResult,
        value: asyncResult.value || currentData,
    } as AsyncStateRetry<LendingPoolData>
}

export function useGameToken() {
    const chainId = useChainId()
    return DAI[chainId]
}

export function useRewardToken() {
    const chainId = useChainId()
    return WETH[chainId]
}
