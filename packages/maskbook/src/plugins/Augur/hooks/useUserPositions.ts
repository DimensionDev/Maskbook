import { useAccount, useAugurConstants } from '@masknet/web3-shared'
import { useAsyncRetry } from 'react-use'
import { PluginAugurRPC } from '../messages'

export function useUserPositions() {
    const { GRAPH_URL } = useAugurConstants()
    const account = useAccount()
    return useAsyncRetry(async () => {
        if (!account || !GRAPH_URL) return
        return PluginAugurRPC.fetchUserPositions(account, GRAPH_URL)
    }, [account, GRAPH_URL])
}
