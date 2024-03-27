import { useSuspenseQuery } from '@tanstack/react-query'
import { PluginSnapshotRPC } from '../../messages.js'
import type { Proposal } from '../../types.js'

export function useProposal(id: string): Proposal {
    return useSuspenseQuery({
        queryKey: ['plugin', 'snapshot', 'fetchProposal', id],
        queryFn: () => PluginSnapshotRPC.fetchProposal(id),
        select(proposal) {
            const status =
                !proposal.isStart ? 'Pending'
                : proposal.isEnd ? 'Closed'
                : 'Active'
            return { ...proposal, status } satisfies Proposal
        },
    }).data
}
