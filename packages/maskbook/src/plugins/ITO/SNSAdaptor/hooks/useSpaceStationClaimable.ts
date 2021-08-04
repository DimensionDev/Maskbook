import { getClaimableTokenCount } from '../../Worker/apis/spaceStationUUPS'
import { useAsyncRetry } from 'react-use'

export function useSpaceStationClaimable(address: string) {
    return useAsyncRetry(async () => {
        const data = await getClaimableTokenCount(address)
        return data.maxCount - data.usedCount > 0
    }, [address])
}
