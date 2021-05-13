import type { PersonaIdentifier, ProfileIdentifier } from '@dimensiondev/maskbook-shared'

export interface ProfileInfo {
    nickname?: string
    connected: boolean
    identifier: ProfileIdentifier
}

export interface PersonaInfo {
    nickname?: string
    identifier: PersonaIdentifier
    linkedProfiles: ProfileInfo[]
}
