import { PluginSnapshotRPC } from '../../messages'
import type { Proposal, ProposalMessage } from '../../types'
import { useSuspense } from '../../../../utils/hooks/useSuspense'

const cache = new Map<string, [0, Promise<void>] | [1, { proposal: Proposal; message: ProposalMessage }] | [2, Error]>()
export function proposalRetry() {
    for (const key of cache.keys()) {
        cache.delete(key)
    }
}
export function useProposal(id: string) {
    return useSuspense<{ proposal: Proposal; message: ProposalMessage }, [string]>(id, [id], cache, Suspender)
}
async function Suspender(id: string) {
    // await testDelay(1000)
    const proposal = await PluginSnapshotRPC.fetchProposal(id)
    const message: ProposalMessage = JSON.parse(proposal.msg)
    const now = Date.now()

    //#region get 3box profile
    const profiles = await PluginSnapshotRPC.fetch3BoxProfiles([proposal.address])
    //#endregion

    proposal.isStart = now > message.payload.start * 1000
    proposal.isEnd = now > message.payload.end * 1000
    proposal.status = !proposal.isStart ? 'Pending' : proposal.isEnd ? 'Closed' : 'Active'
    proposal.authorName = profiles[0]?.name
    proposal.authorAvatar = profiles[0]?.image
    return { proposal, message }
}
