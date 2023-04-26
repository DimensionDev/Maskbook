import { Snapshot } from '@masknet/web3-providers'
import { useAsyncRetry } from 'react-use'

export function useProposalList(spaceId: string) {
    return useAsyncRetry(async () => {
        if (!spaceId) return
        return Snapshot.getProposalListBySpace(spaceId)
    }, [spaceId])
}
