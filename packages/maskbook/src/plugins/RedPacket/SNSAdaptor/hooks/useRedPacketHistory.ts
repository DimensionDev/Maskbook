import { useAsyncRetry } from 'react-use'
import { RedPacketRPC } from '../../messages'
import type { ChainId } from '@masknet/web3-shared'

export function useRedPacketHistory(address: string, chainId: ChainId) {
    return useAsyncRetry(async () => {
        const payloads = await RedPacketRPC.getRedPacketHistoryWithPassword(address, chainId)
        return payloads
    }, [address])
}
