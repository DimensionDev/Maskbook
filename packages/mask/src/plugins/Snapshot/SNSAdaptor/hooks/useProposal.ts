import { PluginSnapshotRPC } from '../../messages.js'
import type { Proposal } from '../../types.js'
import { useSuspense } from '../../../../utils/hooks/useSuspense.js'

const cache = new Map<string, [0, Promise<void>] | [1, Proposal] | [2, Error]>()
export function proposalRetry() {
    for (const key of cache.keys()) {
        cache.delete(key)
    }
}
export function useProposal(id: string) {
    return useSuspense<Proposal, [string]>(id, [id], cache, Suspender)
}
async function Suspender(id: string) {
    const proposal = await PluginSnapshotRPC.fetchProposal(id)

    proposal.status = !proposal.isStart ? 'Pending' : proposal.isEnd ? 'Closed' : 'Active'
    proposal.authorName = proposal.authorName
    proposal.authorAvatar = proposal.authorAvatar
    return proposal
}
