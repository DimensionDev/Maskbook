import type { ProfileIdentifier } from '@dimensiondev/maskbook-shared'

export interface SocialNetworkProvider {
    networkIdentifier: string
    network: string
    connected: boolean
}

export interface PersonaProvider {
    networkIdentifier: string
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
