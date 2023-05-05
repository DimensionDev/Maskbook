import { useAsyncRetry } from 'react-use'
import { EMPTY_LIST } from '@masknet/shared-base'
import { Snapshot } from '@masknet/web3-providers'
import type { SnapshotBaseAPI } from '@masknet/web3-providers/types'

export function useProposalList(spaceId: string, strategyName?: string) {
    return useAsyncRetry<SnapshotBaseAPI.SnapshotProposal[]>(async () => {
        if (!spaceId) return EMPTY_LIST
        return Snapshot.getProposalListBySpace(spaceId, strategyName)
    }, [spaceId, strategyName])
}
