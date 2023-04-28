import { Snapshot } from '@masknet/web3-providers'
import { useAsyncRetry } from 'react-use'

export function useProposalList(spaceId: string, strategyName?: string) {
    return useAsyncRetry(async () => {
        if (!spaceId) return
        return Snapshot.getProposalListBySpace(spaceId, strategyName)
    }, [spaceId, strategyName])
}
