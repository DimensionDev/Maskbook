import { useAsyncRetry } from 'react-use'
import { RedPacketRPC } from '../messages'
import type { ChainId } from '../../../web3/types'

export function useRedPacketHistory(address: string, chainId: ChainId) {
    return useAsyncRetry(async () => {
        const payloads = await RedPacketRPC.getRedPacketHistoryWithPassword(address, chainId)
        return payloads
    }, [address])
}
