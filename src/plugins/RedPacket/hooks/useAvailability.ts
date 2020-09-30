import { useAsyncRetry } from 'react-use'
import { useRedPacketContract } from '../contracts/useRedPacketContract'

export function useAvailability(account: string, id?: string) {
    const redPacketContract = useRedPacketContract()
    return useAsyncRetry(async () => {
        if (!id) return null
        if (!redPacketContract) return null
        return redPacketContract.methods.check_availability(id).call({
            from: account,
        })
    }, [id, account, redPacketContract])
}
