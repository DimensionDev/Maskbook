import { definedSocialNetworkWorkers, SocialNetworkWorker } from '../worker'
import { GroupIdentifier, Identifier, PersonIdentifier, PostIdentifier, PostIVIdentifier } from '../../database/type'

export const find = (network: string) => (v: SocialNetworkWorker) => v.networkIdentifier === network

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
