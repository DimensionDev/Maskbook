import { createContract, formatBalance,  } from '@masknet/web3-shared-evm'
import { useAsyncRetry } from 'react-use'
import { usePoolTogetherPoolContract } from '../contracts/usePoolTogetherPool'
import { PluginPooltogetherRPC } from '../messages'
import PoolTogetherPrizeStrategyABI from '@masknet/web3-contracts/abis/PoolTogetherPrizeStrategy.json'
import type { PoolTogetherPrizeStrategy } from '@masknet/web3-contracts/types/PoolTogetherPrizeStrategy'
import type { AbiItem } from 'web3-utils'
import { useChainId, useWeb3 } from '@masknet/plugin-infra/src/web3'
import { NetworkPluginID } from '@masknet/web3-shared-base'

export function usePools() {
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    return useAsyncRetry(() => PluginPooltogetherRPC.fetchPools(chainId), [chainId])
}

export function usePool(address: string | undefined, subgraphUrl: string | undefined, isCommunityPool: boolean) {
    const web3 = useWeb3(NetworkPluginID.PLUGIN_EVM)
    const chainId=useChainId(NetworkPluginID.PLUGIN_EVM)
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
