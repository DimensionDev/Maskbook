import { useAsyncRetry } from 'react-use'
import { RedPacketRPC } from '../messages'

export function useAllRedPackets(address: string) {
    return useAsyncRetry(async () => {
        const payloads = await RedPacketRPC.getAllRedPackets(address)
        return payloads
    }, [address])
}
