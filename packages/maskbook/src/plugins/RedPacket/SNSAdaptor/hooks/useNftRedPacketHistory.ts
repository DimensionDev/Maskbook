import { useAsyncRetry } from 'react-use'
import { RedPacketRPC } from '../../messages'
import type { ChainId } from '@masknet/web3-shared'

export function useNftRedPacketHistory(address: string, chainId: ChainId) {
    return useAsyncRetry(async () => {
        const payloads = await RedPacketRPC.getNftRedPacketHistory(address, chainId)
        return payloads
    }, [address])
}
