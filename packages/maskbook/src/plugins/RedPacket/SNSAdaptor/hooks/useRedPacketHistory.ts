import { useAsyncRetry } from 'react-use'
import { RedPacketRPC } from '../../messages'
import { ChainId, useBlockNumberOnce } from '@masknet/web3-shared-evm'

export function useRedPacketHistory(address: string, chainId: ChainId) {
    const blockNumber = useBlockNumberOnce()
    return useAsyncRetry(async () => {
        return RedPacketRPC.getRedPacketHistory(address, chainId, blockNumber)
    }, [address, chainId])
}
