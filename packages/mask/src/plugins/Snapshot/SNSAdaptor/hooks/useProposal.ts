import { PluginSnapshotRPC } from '../../messages'
import type { Proposal } from '../../types'
import { useSuspense } from '../../../../utils/hooks/useSuspense'

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
    return proposal
}
