import { PluginSnapshotRPC } from '../messages'
import type { Proposal, ProposalMessage } from '../types'
import { useSuspense } from '../../../utils/hooks/useSuspense'

const cache = new Map<string, [0, Promise<void>] | [1, { proposal: Proposal; message: ProposalMessage }] | [2, Error]>()
export function proposalErrorRetry() {
    cache.forEach(([status], id) => status === 2 && cache.delete(id))
}
export function useProposal(id: string) {
    return useSuspense<{ proposal: Proposal; message: ProposalMessage }, [string]>(id, [id], cache, Suspender)
}
async function Suspender(id: string) {
    // await testDelay(1000)
    const proposal = await PluginSnapshotRPC.fetchProposal(id)
    const message: ProposalMessage = JSON.parse(proposal.msg)
    return { proposal, message }
}

// function testDelay(t: number) {
//     return new Promise<void>(function (resolve) {
//         setTimeout(() => resolve(), t)
//     })
// }
