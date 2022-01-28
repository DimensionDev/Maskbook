import { isEnvironment, Environment } from '@dimensiondev/holoflows-kit'
import { definedSocialNetworkWorkers } from './define'
import type { SocialNetworkWorker } from './types'
import type { ProfileIdentifier } from '@masknet/shared-base'

export const definedSocialNetworkWorkersResolved = new Set<SocialNetworkWorker.Definition>()

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
