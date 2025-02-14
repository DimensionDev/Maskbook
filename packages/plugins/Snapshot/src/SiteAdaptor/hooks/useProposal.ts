import { useSuspenseQuery } from '@tanstack/react-query'
import { PluginSnapshotRPC } from '../../messages.js'

export function useProposal(id: string) {
    return useSuspenseQuery({
        queryKey: ['snapshot', 'proposal', id],
        queryFn: () => PluginSnapshotRPC.fetchProposal(id),
        select(proposal) {
            proposal.status =
                !proposal.isStart ? 'Pending'
                : proposal.isEnd ? 'Closed'
                : 'Active'
            return proposal
        },
    }).data
}
