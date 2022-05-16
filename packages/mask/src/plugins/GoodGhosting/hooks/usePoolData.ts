import { useERC20TokenContract } from '@masknet/plugin-infra/src/entry-web3-evm'
import { useChainId, useFungibleToken } from '@masknet/plugin-infra/src/web3'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import {
    DAI,
    WNATIVE as WETH,
} from '@masknet/web3-shared-evm'
import { useState } from 'react'
import { useAsyncRetry } from 'react-use'
import type { AsyncStateRetry } from 'react-use/lib/useAsyncRetry'
import { useGoodGhostingContract } from '../contracts/useGoodGhostingContract'
import { useGoodGhostingIncentiveContract } from '../contracts/useGoodGhostingIncentivesContract'
import type { GameAssets, GoodGhostingInfo, LendingPoolData } from '../types'

export function usePoolData(info: GoodGhostingInfo) {
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const rewardToken = useRewardToken()
    const contract = useGoodGhostingContract(chainId, info.contractAddress)
    const adaiContract = useERC20TokenContract(chainId, info.adaiTokenAddress)
    const rewardTokenContract = useERC20TokenContract(chainId, rewardToken.address)
    const incentivesContract = useGoodGhostingIncentiveContract(chainId)
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
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    return DAI[chainId]
}

export function useRewardToken() {
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    return WETH[chainId]
}

export function usePoolAssets(): AsyncStateRetry<GameAssets> {
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const gameToken = useGameToken()
    const rewardToken = useRewardToken()

    const {
        value: gameTokenDetailed,
        loading: gameTokenLoading,
        error: gameTokenError,
        retry: gameTokenRetry,
    } = useFungibleToken(NetworkPluginID.PLUGIN_EVM, gameToken.address, {
        chainId,
    })
    const {
        value: rewardTokenDetailed,
        loading: rewardTokenLoading,
        error: rewardTokenError,
        retry: rewardTokenRetry,
    } = useFungibleToken(NetworkPluginID.PLUGIN_EVM, rewardToken.address, {
        chainId,
    })

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
