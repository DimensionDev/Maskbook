import { createContext, useContext } from 'react'
import type { WebExtensionMessage } from '@dimensiondev/holoflows-kit'
import type { ECKeyIdentifier, MaskEvents, PersonaInformation, ProfileIdentifier } from '@masknet/shared-base'
import type { SocialNetworkUI } from '../types.js'

export interface SocialNetworkContext {
    globalState: SocialNetworkUI.AutonomousState
    activatedSocialNetwork: SocialNetworkUI.Definition
    messages: WebExtensionMessage<MaskEvents>
    services: {
        queryPersona: (key: ECKeyIdentifier) => Promise<PersonaInformation | undefined>
        queryPersonaByProfile: (identifier: ProfileIdentifier) => Promise<PersonaInformation | undefined>
    }
}

export const SocialNetworkContext = createContext<SocialNetworkContext>(null!)

export function useGlobalState() {
    return useContext(SocialNetworkContext).globalState
}

export function useSocialNetwork() {
    return useContext(SocialNetworkContext).activatedSocialNetwork
}

export function useMessages() {
    return useContext(SocialNetworkContext).messages
}

export function useServices() {
    return useContext(SocialNetworkContext).services
}
