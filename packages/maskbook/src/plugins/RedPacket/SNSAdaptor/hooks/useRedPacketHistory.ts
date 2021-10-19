import { useMemo } from 'react'
import { useAsyncRetry } from 'react-use'
import { RedPacketRPC } from '../../messages'
import { ChainId, useBlockNumber } from '@masknet/web3-shared-evm'

export function useRedPacketHistory(address: string, chainId: ChainId) {
    const _blockNumber = useBlockNumber()
    const blockNumber = useMemo(() => _blockNumber, [])
    return useAsyncRetry(async () => {
        return RedPacketRPC.getRedPacketHistory(address, chainId, blockNumber)
    }, [address, chainId])
}
