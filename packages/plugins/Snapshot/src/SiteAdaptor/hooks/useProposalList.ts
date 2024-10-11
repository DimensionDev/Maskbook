import { EMPTY_LIST } from '@masknet/shared-base'
import { Snapshot } from '@masknet/web3-providers'
import { useQuery } from '@tanstack/react-query'

export function useProposalList(spaceId: string, strategyName?: string) {
    return useQuery({
        queryKey: ['proposal-list', spaceId, strategyName],
        queryFn: async () => {
            if (!spaceId) return EMPTY_LIST
            return Snapshot.getProposalListBySpace(spaceId, strategyName)
        },
    })
}
