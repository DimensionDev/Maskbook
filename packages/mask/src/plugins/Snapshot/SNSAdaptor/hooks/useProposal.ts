import { PluginSnapshotRPC } from '../../messages.js'
import { use, cache } from 'react'
import type {} from 'react/next'

const Request = cache(Suspender)
export function useProposal(id: string) {
    return use(Request(id))
}
async function Suspender(id: string) {
    const proposal = await PluginSnapshotRPC.fetchProposal(id)

    proposal.status = !proposal.isStart ? 'Pending' : proposal.isEnd ? 'Closed' : 'Active'
    proposal.authorName = proposal.authorName
    proposal.authorAvatar = proposal.authorAvatar
    return proposal
}
