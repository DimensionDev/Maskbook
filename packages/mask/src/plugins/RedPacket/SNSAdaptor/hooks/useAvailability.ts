import { useAsyncRetry } from 'react-use'
import type { ChainId } from '@masknet/web3-shared-evm'
import { useRedPacketContract } from './useRedPacketContract'

export function useAvailability(version: number, from: string, id: string, redpacketChainId: ChainId) {
    const redPacketContract = useRedPacketContract(version, redpacketChainId)
    return useAsyncRetry(async () => {
        if (!id) return null
        if (!redPacketContract) return null
        return redPacketContract.methods.check_availability(id).call({
            // check availability is ok w/o account
            from,
        })
    }, [id, from, redpacketChainId, redPacketContract])
}
