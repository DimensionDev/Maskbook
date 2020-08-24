import { definedSocialNetworkWorkers, SocialNetworkWorker, SocialNetworkWorkerDefinition } from '../worker'
import {
    GroupIdentifier,
    Identifier,
    ProfileIdentifier,
    PostIdentifier,
    PostIVIdentifier,
    ECKeyIdentifier,
} from '../../database/type'
import { Result, Ok, Err } from 'ts-results'

const find = (network: string) => (v: SocialNetworkWorker) => v.networkIdentifier === network

export default function getCurrentNetworkWorker(
    network: string | Identifier,
): Result<Required<SocialNetworkWorkerDefinition>, Error> {
    if (typeof network === 'string') {
        if (network === 'localhost') return Err(new TypeError('Searching a unknown provider'))
        const worker = [...definedSocialNetworkWorkers.values()].find(find(network))
        if (worker === undefined) return Err(new TypeError('Provider not found'))
        return Ok(worker)
    }
    if (network instanceof ProfileIdentifier) {
        if (network.isUnknown) return Err(new TypeError('Searching a unknown provider'))
        return getCurrentNetworkWorker(network.network)
    }
    if (network instanceof GroupIdentifier) return getCurrentNetworkWorker(network.network)
    if (network instanceof PostIdentifier) return getCurrentNetworkWorker(network.identifier)
    if (network instanceof PostIVIdentifier) return getCurrentNetworkWorker(network.network)
    if (network instanceof ECKeyIdentifier) return Err(new Error('Cannot get network from a PersonaIdentifier'))
    return Err(new TypeError('unknown subclass of Identifier'))
}
