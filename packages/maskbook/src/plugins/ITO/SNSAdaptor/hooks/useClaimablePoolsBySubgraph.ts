import { useAsyncRetry } from 'react-use'
import { useAccount, useChainId } from '@masknet/web3-shared'
import type { ClaimablePool } from '../../types'
import { PluginITO_RPC } from '../../messages'

export function useClaimablePoolsBySubgraph() {
    const account = useAccount()
    const chainId = useChainId()
    return useAsyncRetry<ClaimablePool[]>(async () => {
        const results = await PluginITO_RPC.getAllPoolsAsBuyer(account)
        return results.map((r) => r.pool)
    }, [account, chainId])
}
