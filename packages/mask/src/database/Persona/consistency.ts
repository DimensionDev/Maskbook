import type { FullPersonaDBTransaction } from './Persona.db'
import { ECKeyIdentifier, Identifier, PersonaIdentifier, ProfileIdentifier } from '../type'
import type { IdentifierMap } from '../IdentifierMap'
import { restorePrototype } from '../../../utils-pure'
import { unreachable } from '@dimensiondev/kit'

type ReadwriteFullPersonaDBTransaction = FullPersonaDBTransaction<'readwrite'>

export async function assertPersonaDBConsistency(
    behavior: 'fix' | 'throw',
    ...[checkRange, t]: Parameters<typeof checkFullPersonaDBConsistency>
): Promise<Diagnosis[]> {
    const diag: Diagnosis[] = []
    for await (const w of checkFullPersonaDBConsistency(checkRange, t)) {
        diag.push(w)
    }
    if (diag.length) {
        const warn = `PersonaDB is in the inconsistency state`
        console.warn(warn)
        console.info(await t.objectStore('personas').getAll())
        console.info(await t.objectStore('profiles').getAll())
        console.error(...diag)
        if (behavior === 'throw') {
            t.abort()
            throw new Error(warn)
        } else if (t.mode === 'readwrite') {
            console.warn('Try to fix the inconsistent db')
            for (const each of diag) await fixDBInconsistency(each, t).catch(() => {})
        }
    }
    return diag
}
async function fixDBInconsistency(diagnosis: Diagnosis, t: ReadwriteFullPersonaDBTransaction) {
    const personas = t.objectStore('personas')
    const profiles = t.objectStore('profiles')
    switch (diagnosis.type) {
        case Type.Invalid_Persona:
            return personas.delete(diagnosis.invalidPersonaKey)
        case Type.Invalid_Profile:
            return profiles.delete(diagnosis.invalidProfileKey)
        case Type.One_Way_Link_In_Persona:
        case Type.Invalid_Persona_LinkedProfiles: {
            const rec = await personas.get(diagnosis.persona.toText())
            const profileWantToUnlink =
                diagnosis.type === Type.One_Way_Link_In_Persona
                    ? diagnosis.designatedProfile.toText()
                    : diagnosis.invalidProfile
            rec!.linkedProfiles.delete(profileWantToUnlink)
            return personas.put(rec!)
        }
        case Type.One_Way_Link_In_Profile:
        case Type.Invalid_Profile_LinkedPersona: {
            const rec = await profiles.get(diagnosis.profile.toText())
            delete rec!.linkedPersona
            return profiles.put(rec!)
        }
        default:
            return unreachable(diagnosis)
    }
}

async function* checkFullPersonaDBConsistency(
    checkRange: 'full check' | IdentifierMap<ProfileIdentifier | PersonaIdentifier, any>,
    t: ReadwriteFullPersonaDBTransaction,
): AsyncGenerator<Diagnosis, void, unknown> {
    for await (const persona of t.objectStore('personas')) {
        const personaID = Identifier.fromString(persona.key, ECKeyIdentifier)
        if (personaID.err) {
            yield { type: Type.Invalid_Persona, invalidPersonaKey: persona.key, _record: persona.value }
            continue
        }
        if (checkRange === 'full check' || checkRange.has(personaID.val)) {
            yield* checkPersonaLink(personaID.val, t)
        }
    }

    for await (const profile of t.objectStore('profiles')) {
        const profileID = Identifier.fromString(profile.key, ProfileIdentifier)
        if (profileID.err) {
            yield { type: Type.Invalid_Profile, invalidProfileKey: profile.key, _record: profile.value }
        } else if (checkRange === 'full check' || checkRange.has(profileID.val)) {
            yield* checkProfileLink(profileID.val, t)
        }
    }
}
async function* checkPersonaLink(
    personaID: PersonaIdentifier,
    t: ReadwriteFullPersonaDBTransaction,
): AsyncGenerator<Diagnosis, void, unknown> {
    const rec = await t.objectStore('personas').get(personaID.toText())
    const linkedProfiles = rec?.linkedProfiles
    if (!linkedProfiles) return
    for (const each of linkedProfiles) {
        const profileID = Identifier.fromString(each[0], ProfileIdentifier)
        if (profileID.err) {
            yield { type: Type.Invalid_Persona_LinkedProfiles, invalidProfile: each[0], persona: personaID }
            continue
        }
        const profile = await t.objectStore('profiles').get(profileID.val.toText())
        if (!profile?.linkedPersona) {
            yield {
                type: Type.One_Way_Link_In_Persona,
                persona: personaID,
                designatedProfile: profileID.val,
                profileActuallyLinkedPersona: profile?.linkedPersona,
            }
        }
    }
}
async function* checkProfileLink(
    profile: ProfileIdentifier,
    t: ReadwriteFullPersonaDBTransaction,
): AsyncGenerator<Diagnosis, void, unknown> {
    const rec = await t.objectStore('profiles').get(profile.toText())
    const invalidLinkedPersona = rec?.linkedPersona
    if (!invalidLinkedPersona) return
    if (invalidLinkedPersona.type !== 'ec_key') {
        yield { type: Type.Invalid_Profile_LinkedPersona, invalidLinkedPersona, profile }
        return
    }
    const designatedPersona = restorePrototype(invalidLinkedPersona, ECKeyIdentifier.prototype)
    const persona = await t.objectStore('personas').get(designatedPersona.toText())
    if (!persona) {
        yield { type: Type.One_Way_Link_In_Profile, profile, designatedPersona }
    }
}

const enum Type {
    Invalid_Persona = 'invalid identifier in persona',
    Invalid_Persona_LinkedProfiles = 'invalid identifier in persona.linkedProfiles',
    Invalid_Profile = 'invalid identifier in profile',
    Invalid_Profile_LinkedPersona = 'invalid identifier in profile.linkedPersona',
    One_Way_Link_In_Persona = 'a persona linked to a profile meanwhile the profile is not linked to the persona',
    One_Way_Link_In_Profile = 'a profile linked to a persona meanwhile it is not appeared in the persona.linkedProfiles',
}
type Diagnosis =
    | {
          type: Type.Invalid_Persona
          invalidPersonaKey: string
          _record: unknown
      }
    | {
          type: Type.Invalid_Persona_LinkedProfiles
          persona: PersonaIdentifier
          invalidProfile: string
      }
    | {
          type: Type.Invalid_Profile
          invalidProfileKey: string
          _record: unknown
      }
    | {
          type: Type.Invalid_Profile_LinkedPersona
          profile: ProfileIdentifier
          invalidLinkedPersona: unknown
      }
    | {
          type: Type.One_Way_Link_In_Persona
          persona: PersonaIdentifier
          designatedProfile: ProfileIdentifier
          profileActuallyLinkedPersona?: unknown
      }
    | {
          type: Type.One_Way_Link_In_Profile
          profile: ProfileIdentifier
          designatedPersona: PersonaIdentifier
      }
