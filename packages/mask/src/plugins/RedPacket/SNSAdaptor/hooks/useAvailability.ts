import { useAsyncRetry } from 'react-use'
import { useChainId } from '@masknet/plugin-infra/web3'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import type { ChainId } from '@masknet/web3-shared-evm'
import { useRedPacketContract } from './useRedPacketContract'

export function useAvailability(version: number, from: string, id: string, redpacketChainId: ChainId) {
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const redPacketContract = useRedPacketContract(chainId, version)
    return useAsyncRetry(async () => {
        if (!id || redpacketChainId !== chainId) return null
        if (!redPacketContract) return null
        return redPacketContract.methods.check_availability(id).call({
            // check availability is ok w/o account
            from,
        })
    }, [id, from, redpacketChainId, chainId, redPacketContract])
}
