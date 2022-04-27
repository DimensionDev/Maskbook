import type { PersonaIdentifier, ReadonlyIdentifierMap, ProfileIdentifier } from '@masknet/shared-base'
import type { LinkedProfileDetails, PersonaRecord } from '../../../database/persona/type'

export interface MobilePersona {
    identifier: PersonaIdentifier
    nickname?: string
    linkedProfiles: ReadonlyIdentifierMap<ProfileIdentifier, LinkedProfileDetails>
    hasPrivateKey: boolean
    createdAt: Date
    updatedAt: Date
}
/** @internal */
export function personaRecordToMobilePersona(persona: PersonaRecord): MobilePersona
export function personaRecordToMobilePersona(persona: PersonaRecord | null): MobilePersona | null
export function personaRecordToMobilePersona(persona: PersonaRecord | void): MobilePersona | void
export function personaRecordToMobilePersona(persona: PersonaRecord | null | void): MobilePersona | null | void {
    if (!persona) return persona
    return {
        identifier: persona.identifier,
        createdAt: persona.createdAt,
        updatedAt: persona.updatedAt,
        hasPrivateKey: !!persona.privateKey,
        linkedProfiles: persona.linkedProfiles,
        nickname: persona.nickname,
    }
}
