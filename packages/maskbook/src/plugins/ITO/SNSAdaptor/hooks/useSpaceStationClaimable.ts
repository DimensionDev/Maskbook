import { getClaimableTokenCount } from '../../Worker/apis/spaceStationGalaxy'
import { useAsyncRetry } from 'react-use'

export function useSpaceStationClaimable(address: string) {
    return useAsyncRetry(async () => {
        const data = await getClaimableTokenCount(address)
        return {
            claimable: data.maxCount - data.usedCount > 0,
            claimed: data.maxCount > 0 && data.maxCount - data.usedCount === 0,
        }
    }, [address])
}
