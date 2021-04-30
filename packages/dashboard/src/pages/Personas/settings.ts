// TODO: Replace to new settings utils
import { createInternalSettings } from '../../../../maskbook/src/settings/createSettings'
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
    providers?: PersonaProvider[]
}

export const currentPersonaSettings = createInternalSettings<string>('currentPersona', '{}')
