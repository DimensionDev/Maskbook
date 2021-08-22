import { useAssets, useChainId, useERC20TokenContract, useERC20TokenDetailed } from '@masknet/web3-shared'
import { useState } from 'react'
import { useAsyncRetry } from 'react-use'
import type { AsyncStateRetry } from 'react-use/lib/useAsyncRetry'
import { DAI, WETH } from '../constants'
import { useGoodGhostingContract } from '../contracts/useGoodGhostingContract'
import { useGoodGhostingIncentiveContract } from '../contracts/useGoodGhostingIncentivesContract'
import type { GameAssets, GoodGhostingInfo, LendingPoolData } from '../types'

export function usePoolData(info: GoodGhostingInfo) {
    const rewardToken = useRewardToken()
    const contract = useGoodGhostingContract(info.contractAddress)
    const adaiContract = useERC20TokenContract(info.adaiTokenAddress)
    const rewardTokenContract = useERC20TokenContract(rewardToken.address)
    const incentivesContract = useGoodGhostingIncentiveContract()
    const [currentData, setCurrentData] = useState<LendingPoolData>()

    const asyncResult = useAsyncRetry(async () => {
        if (!contract || !rewardTokenContract || !adaiContract || !incentivesContract) return

        const [incentives, totalAdai, reward] = await Promise.all([
            incentivesContract.methods.getRewardsBalance([info.adaiTokenAddress], info.contractAddress).call(),
            adaiContract.methods.balanceOf(info.contractAddress).call(),
            rewardTokenContract.methods.balanceOf(info.contractAddress).call(),
        ])
        const data: LendingPoolData = {
            incentives,
            totalAdai,
            reward,
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

export function usePoolAssets(): AsyncStateRetry<GameAssets> {
    const gameToken = useGameToken()
    const rewardToken = useRewardToken()

    const {
        value: gameTokenDetailed,
        loading: gameTokenLoading,
        error: gameTokenError,
        retry: gameTokenRetry,
    } = useERC20TokenDetailed(gameToken.address)
    const {
        value: rewardTokenDetailed,
        loading: rewardTokenLoading,
        error: rewardTokenError,
        retry: rewardTokenRetry,
    } = useERC20TokenDetailed(rewardToken.address)

    const assets = gameTokenDetailed && rewardTokenDetailed ? [gameTokenDetailed, rewardTokenDetailed] : []

    const { value, loading, error, retry } = useAssets(assets)

    const assetRetry = () => {
        if (gameTokenError) gameTokenRetry()
        else if (rewardTokenError) rewardTokenRetry()
        else retry()
    }

    let gameAssets
    if (value?.length) {
        const gameAsset = value.find((asset) => asset.token.address === gameToken.address)
        const rewardAsset = value.find((asset) => asset.token.address === rewardToken.address)
        gameAssets = {
            gameAsset,
            rewardAsset,
        }
    }

    return {
        value: gameAssets,
        error: error || gameTokenError || rewardTokenError,
        loading: loading || gameTokenLoading || rewardTokenLoading,
        retry: assetRetry,
    } as AsyncStateRetry<GameAssets>
}
