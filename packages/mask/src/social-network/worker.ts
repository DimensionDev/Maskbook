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
export async function getNetworkWorker(network: string | ProfileIdentifier): Promise<SocialNetworkWorker.Definition> {
    if (typeof network === 'string') return activateNetworkWorker(network)
    return getNetworkWorker(network.network)
}
