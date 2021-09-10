import { PluginITO_RPC } from '../../messages'
import { useAsyncRetry } from 'react-use'

export function useSpaceStationClaimable(address: string) {
    return useAsyncRetry(async () => {
        const data = await PluginITO_RPC.getClaimableTokenCount(address)
        return {
            claimable: data.maxCount - data.usedCount > 0,
            claimed: data.maxCount > 0 && data.maxCount - data.usedCount === 0,
        }
    }, [address])
}
