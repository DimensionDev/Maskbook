import { use, cache } from 'react'
import { PluginSnapshotRPC } from '../../messages.js'

const Request = cache(Suspender)
export function useProposal(id: string) {
    return use(Request(id))
}
async function Suspender(id: string) {
    const proposal = await PluginSnapshotRPC.fetchProposal(id)
    proposal.status = !proposal.isStart ? 'Pending' : proposal.isEnd ? 'Closed' : 'Active'
    return proposal
}
