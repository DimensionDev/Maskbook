import { useAsyncRetry } from 'react-use'
import { useRedPacketContract } from '../contracts/useRedPacketContract'

export function useAvailability(from: string, id?: string) {
    const redPacketContract = useRedPacketContract()
    return useAsyncRetry(async () => {
        if (!id) return null
        if (!redPacketContract) return null
        return redPacketContract.check_availability(id).call({
            // check availability is ok w/o account
            from,
        })
    }, [id, from, redPacketContract])
}
