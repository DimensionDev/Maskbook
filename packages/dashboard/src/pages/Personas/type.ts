import type { PersonaIdentifier, ProfileIdentifier } from '@dimensiondev/maskbook-shared'

export interface PersonaProvider {
    networkIdentifier: string
    connected: boolean
    userId?: string
    identifier?: ProfileIdentifier
}

export interface PersonaInfo {
    nickname?: string
    identifier: PersonaIdentifier
    providers: PersonaProvider[]
}
