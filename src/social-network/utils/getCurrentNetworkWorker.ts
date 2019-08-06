import { definedSocialNetworkWorkers, SocialNetworkWorker } from '../worker'
import { Identifier, PersonIdentifier, PostIdentifier, GroupIdentifier } from '../../database/type'
import { env } from '../shared'

function find(network: string) {
    return (v: SocialNetworkWorker) => {
        if (typeof v.networkIdentifier === 'string') return v.networkIdentifier === network
        else return v.networkIdentifier(network, env, {})
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
    throw new TypeError('unknown subclass of Identifier')
}
