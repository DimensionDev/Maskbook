import { useChainId } from '@masknet/web3-shared-evm'
import { useAsyncRetry } from 'react-use'
import { PluginPooltogetherRPC } from '../messages'

export function usePools() {
    const chainId = useChainId()
    return useAsyncRetry(() => PluginPooltogetherRPC.fetchPools(chainId), [chainId])
}
