import { createContract } from '@masknet/web3-shared-evm'
import { useAsyncRetry } from 'react-use'
import { usePoolTogetherPoolContract } from '../contracts/usePoolTogetherPool.js'
import { PluginPooltogetherRPC } from '../messages.js'
import PoolTogetherPrizeStrategyABI from '@masknet/web3-contracts/abis/PoolTogetherPrizeStrategy.json'
import type { PoolTogetherPrizeStrategy } from '@masknet/web3-contracts/types/PoolTogetherPrizeStrategy'
import type { AbiItem } from 'web3-utils'
import { useChainContext, useWeb3 } from '@masknet/web3-hooks-base'
import { formatBalance } from '@masknet/web3-shared-base'
import { NetworkPluginID } from '@masknet/shared-base'

export function usePools() {
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    return useAsyncRetry(() => PluginPooltogetherRPC.fetchPools(chainId), [chainId])
}

export function usePool(address: string | undefined, subgraphUrl: string | undefined, isCommunityPool: boolean) {
    const web3 = useWeb3(NetworkPluginID.PLUGIN_EVM)
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const poolContract = usePoolTogetherPoolContract(chainId, address)

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
