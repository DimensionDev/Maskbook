import { useAsyncRetry } from 'react-use'
import { ChainId, useChainId } from '@masknet/web3-shared-evm'
import { useRedPacketContract } from './useRedPacketContract'

export function useAvailability(version: number, from: string, id: string, redpacketChainId: ChainId) {
    const redPacketContract = useRedPacketContract(version)
    const currentChainId = useChainId()
    return useAsyncRetry(async () => {
        if (!id || redpacketChainId !== currentChainId) return null
        if (!redPacketContract) return null
        return redPacketContract.methods.check_availability(id).call({
            // check availability is ok w/o account
            from,
        })
    }, [id, from, redPacketContract])
}
