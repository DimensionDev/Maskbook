import { definedSocialNetworkWorkers, SocialNetworkWorker } from '../worker'
import { GroupIdentifier, Identifier, PersonIdentifier, PostIdentifier, PostIVIdentifier } from '../../database/type'
import { env } from '../shared'

function find(network: string) {
    return (v: SocialNetworkWorker) => {
        // noinspection SuspiciousTypeOfGuard
        if (typeof v.networkIdentifier === 'string') return v.networkIdentifier === network
        // @ts-ignore   this is a robust design since sometimes non-string id may supported.
        return v.networkIdentifier(network, env, {})
    }
}
export default function getCurrentNetworkWorker(network: string | Identifier): SocialNetworkWorker {
    if (typeof network === 'string') {
        if (network === 'localhost') throw new TypeError('Searching a unknown provider')
        const worker = [...definedSocialNetworkWorkers.values()].find(find(network))
        if (worker === undefined) throw new TypeError('Provider not found')
        return worker
    }
    if (network instanceof PersonIdentifier) {
        if (network.isUnknown) throw new TypeError('Searching a unknown provider')
        return getCurrentNetworkWorker(network.network)
    }
    if (network instanceof GroupIdentifier) return getCurrentNetworkWorker(network.network)
    if (network instanceof PostIdentifier) return getCurrentNetworkWorker(network.identifier)
    if (network instanceof PostIVIdentifier) return getCurrentNetworkWorker(network.network)
    throw new TypeError('unknown subclass of Identifier')
}
