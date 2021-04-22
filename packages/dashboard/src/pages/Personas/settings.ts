import { createInternalSettings } from '../../../../maskbook/src/settings/createSettings'
import type { Persona } from '../../../../maskbook/src/database'
import type { ProfileIdentifier } from '@dimensiondev/maskbook-shared'

export interface PersonaProvider {
    internalName: string
    network: string
    connected: boolean
    userId?: string
    identifier?: ProfileIdentifier
}

export interface PersonaInfo {
    identifier?: string
    persona?: Persona
    providers?: PersonaProvider[]
}

export const currentPersonaSettings = createInternalSettings<string>('currentPersona', '{}')
