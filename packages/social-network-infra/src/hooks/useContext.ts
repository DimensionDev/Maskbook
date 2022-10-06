import { createContext, useContext } from 'react'
import type { WebExtensionMessage } from '@dimensiondev/holoflows-kit'
import type {
    ECKeyIdentifier,
    MaskEvents,
    PersonaIdentifier,
    PersonaInformation,
    ProfileIdentifier,
} from '@masknet/shared-base'
import type { SocialNetworkUI } from '../types.js'

export interface SocialNetworkContext {
    globalState: SocialNetworkUI.AutonomousState
    activatedSocialNetwork: SocialNetworkUI.Definition
    messages: WebExtensionMessage<MaskEvents>
    services: {
        queryPersona: (key: ECKeyIdentifier) => Promise<PersonaInformation | undefined>
        getPersonaAvatars: (keys: ECKeyIdentifier[]) => Promise<Map<ProfileIdentifier | PersonaIdentifier, string>>
        queryPersonaByProfile: (identifier: ProfileIdentifier) => Promise<PersonaInformation | undefined>
        queryOwnedPersonaInformation: (initializedOnly: boolean) => Promise<PersonaInformation[]>
    }
}

export const SocialNetworkContext = createContext<SocialNetworkContext>(null!)

export function useGlobalState() {
    return useContext(SocialNetworkContext).globalState
}

export function useSocialNetwork() {
    return useContext(SocialNetworkContext).activatedSocialNetwork
}

export function useSocialNetworkConfiguration<T>(
    preidcate: (configuration: SocialNetworkUI.Configuration.Define) => T,
): T {
    const socialNetwork = useSocialNetwork()
    return preidcate(socialNetwork.configuration)
}

export function useMessages() {
    return useContext(SocialNetworkContext).messages
}

export function useServices() {
    return useContext(SocialNetworkContext).services
}
