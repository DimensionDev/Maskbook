import type { PersonaIdentifier, ProfileIdentifier } from '@dimensiondev/maskbook-shared'

export interface ProfileInfo {
    connected: boolean
    identifier: ProfileIdentifier
}

export interface PersonaInfo {
    nickname?: string
    identifier: PersonaIdentifier
    linkedProfiles: ProfileInfo[]
}
