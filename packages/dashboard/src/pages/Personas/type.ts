import type { ProfileIdentifier } from '@dimensiondev/maskbook-shared'

export interface SocialNetworkProvider {
    internalName: string
    network: string
    connected: boolean
}

export interface PersonaProvider {
    internalName: string
    network: string
    connected: boolean
    userId?: string
    identifier?: ProfileIdentifier
}

export interface PersonaInfo {
    nickname: string
    identifier?: string
    providers?: PersonaProvider[]
}
