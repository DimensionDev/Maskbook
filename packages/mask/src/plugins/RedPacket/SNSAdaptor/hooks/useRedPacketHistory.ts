import { useAsyncRetry } from 'react-use'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import type { ChainId } from '@masknet/web3-shared-evm'
import { useBlockNumber } from '@masknet/plugin-infra/web3'
import { RedPacketRPC } from '../../messages'

export function useRedPacketHistory(address: string, chainId: ChainId) {
    const { value: blockNumber = 0 } = useBlockNumber(NetworkPluginID.PLUGIN_EVM)
    return useAsyncRetry(async () => {
        if (!blockNumber) return []
        return RedPacketRPC.getRedPacketHistory(address, chainId, blockNumber)
    }, [address, chainId, blockNumber])
}
