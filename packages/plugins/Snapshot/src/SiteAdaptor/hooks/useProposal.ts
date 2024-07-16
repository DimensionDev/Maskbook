import { PluginSnapshotRPC } from '../../messages.js'
import { useSuspenseQuery } from '@tanstack/react-query'

export function useProposal(id: string) {
    return useSuspenseQuery({
        queryKey: ['plugin', 'snapshot', 'fetchProposal', id],
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
