import { Snapshot } from '@masknet/web3-providers'
import { useAsyncRetry } from 'react-use'

export function useSpaceMemberList(spaceId: string) {
    return useAsyncRetry(async () => {
        if (!spaceId) return
        return Snapshot.getSpaceMemberList(spaceId)
    }, [spaceId])
}
