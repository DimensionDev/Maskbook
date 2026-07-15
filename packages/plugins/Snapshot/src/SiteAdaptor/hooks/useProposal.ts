import { useSuspenseQuery } from '@tanstack/react-query'
import { PluginSnapshotRPC } from '../../messages.js'

export function useProposal(id: string) {
    return useSuspenseQuery({
        queryKey: ['snapshot', 'proposal', id],
        queryFn: () => PluginSnapshotRPC.fetchProposal(id),
        select(proposal) {
            proposal.status =
                proposal.isStart ?
                    proposal.isEnd ?
                        'Closed'
                    :   'Active'
                :   'Pending'
            return proposal
        },
    }).data
}
