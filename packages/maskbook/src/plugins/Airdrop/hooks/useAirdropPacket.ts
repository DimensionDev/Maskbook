import { useAsyncRetry } from 'react-use'
import { AirdropRPC } from '../messages'

export function useAirdropPacket(address: string) {
    return useAsyncRetry(async () => {
        if (!address) return
        return AirdropRPC.getMaskAirdropPacket(address)
    }, [address])
}
