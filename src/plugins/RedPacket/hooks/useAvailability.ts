import { useRedPacketContract } from '../contracts/useRedPacketContract'
import { useAsync, useAsyncRetry } from 'react-use'

export function useAvailability(account: string, id?: string) {
    const redPacketContract = useRedPacketContract()
    return useAsync(async () => {
        if (!id) return null
        if (!redPacketContract) return null
        return redPacketContract.methods.check_availability(id).call({
            from: account,
        })
    }, [redPacketContract])
}

export function useAvailabilityRetry(account: string, id?: string) {
    const redPacketContract = useRedPacketContract()
    return useAsyncRetry(async () => {
        if (!id) return
        if (!redPacketContract) return
        return redPacketContract.methods.check_availability(id).call({
            from: account,
        })
    }, [redPacketContract])
}
