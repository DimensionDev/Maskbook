import { PluginSnapshotRPC } from '../messages'
import type { Proposal } from '../types'
import { useSuspense } from '../../../utils/hooks/useSuspense'

const cache = new Map<string, [0, Promise<void>] | [1, Proposal] | [2, Error]>()
export function proposalErrorRetry() {
    cache.forEach(([status], id) => status === 2 && cache.delete(id))
}
export function useProposal(id: string) {
    return useSuspense<Proposal, [string]>(id, [id], cache, Suspender)
}
async function Suspender(id: string) {
    // await testDelay(1000)
    return PluginSnapshotRPC.fetchProposal(id)
}

// function testDelay(t: number) {
//     return new Promise<void>(function (resolve) {
//         setTimeout(() => resolve(), t)
//     })
// }
