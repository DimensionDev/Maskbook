import { useAsyncRetry } from 'react-use'
import { RedPacketRPC } from '../messages'

export function useRedPacketHistory(address: string) {
    return useAsyncRetry(async () => {
        const payloads = await RedPacketRPC.getRedPacketHistoryWithPassword(address)
        return payloads
    }, [address])
}
