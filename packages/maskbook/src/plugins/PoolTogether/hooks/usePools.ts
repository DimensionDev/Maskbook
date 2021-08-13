import { createContract, formatBalance, useChainId, useWeb3 } from '@masknet/web3-shared'
import { useAsyncRetry } from 'react-use'
import { usePoolTogetherPoolContract } from '../contracts/usePoolTogetherPool'
import { PluginPooltogetherRPC } from '../messages'
import PoolTogetherPrizeStrategyABI from '@masknet/web3-contracts/abis/PoolTogetherPrizeStrategy.json'
import type { PoolTogetherPrizeStrategy } from '@masknet/web3-contracts/types/PoolTogetherPrizeStrategy'
import type { AbiItem } from 'web3-utils'

export function usePools() {
    const chainId = useChainId()
    return useAsyncRetry(() => PluginPooltogetherRPC.fetchPools(chainId), [chainId])
}

export function usePool(address: string | undefined, subgraphUrl: string | undefined, isCommunityPool: boolean) {
    const poolContract = usePoolTogetherPoolContract(address)
    const web3 = useWeb3()

    return useAsyncRetry(async () => {
        if (!address || !subgraphUrl || !poolContract) return undefined
        const pool = await PluginPooltogetherRPC.fetchPool(address, subgraphUrl)
        if (!pool) return

        const prizeStrategyAddress = await poolContract.methods.prizeStrategy().call()
        const prizeStrategyContract = createContract(
            web3,
            prizeStrategyAddress,
            PoolTogetherPrizeStrategyABI as AbiItem[],
        ) as PoolTogetherPrizeStrategy

        pool.prize.prizePeriodEndAt = await prizeStrategyContract.methods.prizePeriodEndAt().call()
        const awardBalance = await poolContract.methods.awardBalance().call()
        pool.prize.amount = formatBalance(awardBalance, Number.parseInt(pool.tokens.underlyingToken.decimals, 10))
        pool.isCommunityPool = isCommunityPool
        return pool
    }, [address, subgraphUrl, isCommunityPool])
}
