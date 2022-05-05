import type { MobilePersona } from '@masknet/public-api'
import type { PersonaRecord } from '../../../database/persona/type'

/** @internal */
export function personaRecordToMobilePersona(persona: PersonaRecord): MobilePersona
export function personaRecordToMobilePersona(persona: PersonaRecord | null): MobilePersona | null
export function personaRecordToMobilePersona(persona: PersonaRecord | void): MobilePersona | void
export function personaRecordToMobilePersona(persona: PersonaRecord | null | void): MobilePersona | null | void {
    if (!persona) return persona

    const profiles = {}
    for (const [key, value] of persona.linkedProfiles) {
        const k = key.toText()
        Object.assign(profiles, { [k]: value?.connectionConfirmState })
    }
    return {
        identifier: persona.identifier.toText(),
        createdAt: persona.createdAt.getTime(),
        updatedAt: persona.updatedAt.getTime(),
        hasPrivateKey: !!persona.privateKey,
        linkedProfiles: profiles,
        nickname: persona.nickname,
    }
}
