import { useAsyncRetry } from 'react-use'
import { useAccount, ChainId } from '@masknet/web3-shared-evm'
import type { ClaimablePool } from '../../types'
import { PluginITO_RPC } from '../../messages'

export function useClaimablePoolsBySubgraph(chainId: ChainId) {
    const account = useAccount()
    return useAsyncRetry<ClaimablePool[]>(async () => {
        const results = await PluginITO_RPC.getAllPoolsAsBuyer(account, chainId)
        return results.map((r) => r.pool)
    }, [account, chainId])
}
