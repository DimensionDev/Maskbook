import type { Persona } from '../../../../database'
import { activatedSocialNetworkUI } from '../../../../social-network'

export function getProfileIdentitierFromPersona(persona: Persona) {
    const profiles = persona ? [...persona.linkedProfiles] : []
    const profile = profiles.find(([key, value]) => key.network === activatedSocialNetworkUI.networkIdentifier)
    return profile?.[0]
}
