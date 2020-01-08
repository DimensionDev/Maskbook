import {
    GroupIdentifier,
    Identifier,
    ProfileIdentifier,
    PostIdentifier,
    PostIVIdentifier,
    ECKeyIdentifier,
} from '../../database/type'
import { definedSocialNetworkUIs, SocialNetworkUIDefinition } from '../ui'

const find = (network: string) => (v: SocialNetworkUIDefinition) => v.networkIdentifier === network

export default function getCurrentNetworkUI(network: string | Identifier): SocialNetworkUIDefinition {
    if (typeof network === 'string') {
        if (network === 'localhost') throw new TypeError('Searching a unknown provider')
        const worker = [...definedSocialNetworkUIs.values()].find(find(network))
        if (worker === undefined) throw new TypeError('Provider not found')
        return worker
    }
    if (network instanceof ProfileIdentifier) {
        if (network.isUnknown) throw new TypeError('Searching a unknown provider')
        return getCurrentNetworkUI(network.network)
    }
    if (network instanceof GroupIdentifier) return getCurrentNetworkUI(network.network)
    if (network instanceof PostIdentifier) return getCurrentNetworkUI(network.identifier)
    if (network instanceof PostIVIdentifier) return getCurrentNetworkUI(network.network)
    if (network instanceof ECKeyIdentifier)
        throw new TypeError("It's impossible to search provider for PersonaIdentifier")
    throw new TypeError('unknown subclass of Identifier')
}
