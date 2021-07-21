import { formatBalance, useChainId } from '@masknet/web3-shared'
import { useAsyncRetry } from 'react-use'
import { usePoolTogetherPoolContract } from '../contracts/usePoolTogetherPool'
import { PluginPooltogetherRPC } from '../messages'

export function usePools() {
    const chainId = useChainId()
    return useAsyncRetry(() => PluginPooltogetherRPC.fetchPools(chainId), [chainId])
}

export function usePool(address: string | undefined, subgraphUrl: string | undefined, isCommunityPool: boolean) {
    const poolContract = usePoolTogetherPoolContract(address)
    return useAsyncRetry(async () => {
        if (!address || !subgraphUrl) return undefined
        const pool = await PluginPooltogetherRPC.fetchPool(address, subgraphUrl)
        const awardBalance = await poolContract?.methods.awardBalance().call()
        if (pool) {
            pool.isCommunityPool = isCommunityPool
            pool.prize.amount = formatBalance(awardBalance, Number.parseInt(pool.tokens.underlyingToken.decimals, 10))
        }
        return pool
    }, [address, subgraphUrl, isCommunityPool])
}
