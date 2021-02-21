import { useAsyncRetry } from 'react-use'
import { PluginAirdropRPC } from '../messages'

export function useAirdropPacket(address: string) {
    return useAsyncRetry(async () => {
        if (!address) return
        return PluginAirdropRPC.getMaskAirdropPacket(address)
    }, [address])
}
