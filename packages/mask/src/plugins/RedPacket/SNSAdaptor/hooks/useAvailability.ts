import { useAsyncRetry } from 'react-use'
import { useRedPacketContract } from './useRedPacketContract'

export function useAvailability(version: number, from: string, id?: string) {
    const redPacketContract = useRedPacketContract(version)
    return useAsyncRetry(async () => {
        if (!id) return null
        if (!redPacketContract) return null
        return redPacketContract.methods.check_availability(id).call({
            // check availability is ok w/o account
            from,
        })
    }, [id, from, redPacketContract])
}
