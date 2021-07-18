import { useChainId } from '@masknet/web3-shared'
import { useAsyncRetry } from 'react-use'
import { usePoolTogetherPoolContract } from '../contracts/usePoolTogetherPool'
import { PluginPooltogetherRPC } from '../messages'

export function usePools() {
    const chainId = useChainId()
    return useAsyncRetry(() => PluginPooltogetherRPC.fetchPools(chainId), [chainId])
}

export function usePool(address: string, subgraphUrl: string) {
    return useAsyncRetry(() => PluginPooltogetherRPC.fetchPool(address, subgraphUrl), [address, subgraphUrl])
}

export function usePoolAwardBalance(address: string) {
    const poolContract = usePoolTogetherPoolContract(address)
    return useAsyncRetry(async () => {
        return poolContract?.methods.awardBalance().call()
    }, [address])
}
