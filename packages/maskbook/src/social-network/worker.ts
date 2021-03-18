import { isEnvironment, Environment } from '@dimensiondev/holoflows-kit'
import type { SocialNetworkWorker } from '.'
import type { ProfileIdentifier } from '@dimensiondev/maskbook-shared'

export const definedSocialNetworkWorkers = new Set<SocialNetworkWorker.DeferredDefinition>()
export const definedSocialNetworkWorkersResolved = new Set<SocialNetworkWorker.Definition>()

export function defineSocialNetworkWorker(worker: SocialNetworkWorker.DeferredDefinition) {
    if (worker.notReadyForProduction && process.env.NODE_ENV === 'production') return
    definedSocialNetworkWorkers.add(worker)
}

async function activateNetworkWorker(id: string): Promise<SocialNetworkWorker.Definition> {
    if (!isEnvironment(Environment.ManifestBackground)) {
        throw new TypeError()
    }
    for (const each of definedSocialNetworkWorkersResolved) {
        if (each.networkIdentifier === id) return each
    }
    for (const each of definedSocialNetworkWorkers) {
        if (each.networkIdentifier === id) {
            const worker = (await each.load()).default
            definedSocialNetworkWorkersResolved.add(worker)
            return worker
        }
    }
    throw new Error('Worker not found')
}
export type NetworkWorkerQuery = string | ProfileIdentifier
export async function getNetworkWorker(network: NetworkWorkerQuery): Promise<SocialNetworkWorker.Definition> {
    if (typeof network === 'string') return activateNetworkWorker(network)
    return getNetworkWorker(network.network)
}

export function getNetworkWorkerUninitialized(
    network: string | ProfileIdentifier,
): SocialNetworkWorker.DeferredDefinition | undefined {
    if (typeof network === 'string')
        return [...definedSocialNetworkWorkers].find((x) => x.networkIdentifier === network)
    return getNetworkWorkerUninitialized(network.network)
}
