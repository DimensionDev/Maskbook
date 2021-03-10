import { isEnvironment, Environment } from '@dimensiondev/holoflows-kit'
import type { SocialNetworkWorker } from '.'

export const definedSocialNetworkWorkers = new Set<SocialNetworkWorker.DeferredDefinition>()
export const definedSocialNetworkWorkersResolved = new Set<SocialNetworkWorker.Definition>()
export async function defineSocialNetworkWorker(worker: SocialNetworkWorker.DeferredDefinition) {
    if (worker.notReadyForProduction) {
        if (process.env.NODE_ENV === 'production') return
    }

    definedSocialNetworkWorkers.add(worker)
    if (isEnvironment(Environment.ManifestBackground)) {
        const resolved = await worker.load()
        definedSocialNetworkWorkersResolved.add(resolved.default)
        console.log('Activating social network provider', worker.networkIdentifier, worker)
    }
}
