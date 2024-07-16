import { useAsyncRetry } from 'react-use'
import { Snapshot } from '@masknet/web3-providers'
import type { SnapshotBaseAPI } from '@masknet/web3-providers/types'

export function useSpace(spaceId: string) {
    return useAsyncRetry<SnapshotBaseAPI.SnapshotSpace | undefined>(async () => {
        if (!spaceId) return
        return Snapshot.getSpace(spaceId)
    }, [spaceId])
}
