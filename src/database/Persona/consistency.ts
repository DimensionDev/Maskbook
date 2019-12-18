import { IDBPTransaction } from 'idb'
import { PersonaDB } from './Persona.db'
import { ProfileIdentifier, PersonaIdentifier, Identifier, ECKeyIdentifier } from '../type'
import { IdentifierMap } from '../IdentifierMap'
import { restorePrototype } from '../../utils/type'

export async function assertPersonaDBConsistency(
    behavior: 'fix' | 'throw',
    ...[checkRange, t]: Parameters<typeof checkFullPersonaDBConsistency>
): Promise<Diagnosis[]> {
    // TODO: implement this
    if (behavior === 'fix') throw new Error('Not implemented')
    const diag: Diagnosis[] = []
    for await (const w of checkFullPersonaDBConsistency(checkRange, t)) {
        diag.push(w)
    }
    if (diag.length) {
        console.info(await t.objectStore('personas').getAll())
        console.info(await t.objectStore('profiles').getAll())
        console.error(...diag)
        t.abort()
        throw new Error(`PersonaDB is in the inconsistency state`)
    }
    return diag
}

async function* checkFullPersonaDBConsistency(
    checkRange: 'full check' | IdentifierMap<ProfileIdentifier | PersonaIdentifier, any>,
    t: IDBPTransaction<PersonaDB, ['personas', 'profiles']>,
): AsyncGenerator<Diagnosis, void, unknown> {
    for await (const persona of t.objectStore('personas')) {
        const personaID = Identifier.fromString(persona.key, ECKeyIdentifier)
        if (!personaID.value) {
            yield { type: Type.Invalid_Persona, key: persona.key, value: persona.value }
            continue
        }
        if (checkRange === 'full check' || checkRange.has(personaID.value)) {
            yield* checkPersonaLink(personaID.value, t)
        }
    }

    for await (const profile of t.objectStore('profiles')) {
        const profileID = Identifier.fromString(profile.key, ProfileIdentifier)
        if (!profileID.value) {
            yield { type: Type.Invalid_Profile, key: profile.key, value: profile.value }
        } else if (checkRange === 'full check' || checkRange.has(profileID.value)) {
            yield* checkProfileLink(profileID.value, t)
        }
    }
}
async function* checkPersonaLink(
    personaID: PersonaIdentifier,
    t: IDBPTransaction<PersonaDB, ['personas', 'profiles']>,
): AsyncGenerator<Diagnosis, void, unknown> {
    const rec = await t.objectStore('personas').get(personaID.toText())
    const linkedProfiles = rec?.linkedProfiles
    if (!linkedProfiles) return
    for (const each of linkedProfiles) {
        const profileID = Identifier.fromString(each[0], ProfileIdentifier)
        if (!profileID.value) {
            yield { type: Type.Invalid_Persona_LinkedProfiles, key: each[0], of: personaID }
            continue
        }
        const profile = await t.objectStore('profiles').get(profileID.value.toText())
        if (!profile?.linkedPersona) {
            yield {
                type: Type.One_Way_Link_In_Persona,
                persona: personaID,
                profile: profileID.value,
                profileLined: profile?.linkedPersona,
            }
        }
    }
}
async function* checkProfileLink(
    profile: ProfileIdentifier,
    t: IDBPTransaction<PersonaDB, ['personas', 'profiles']>,
): AsyncGenerator<Diagnosis, void, unknown> {
    const rec = await t.objectStore('profiles').get(profile.toText())
    const linkedPersona = rec?.linkedPersona
    if (!linkedPersona) return
    if (linkedPersona.type !== 'ec_key') {
        yield { type: Type.Invalid_Profile_LinkedPersona, key: linkedPersona }
        return
    }
    const personaID = restorePrototype(linkedPersona, ECKeyIdentifier.prototype)
    const persona = await t.objectStore('personas').get(personaID.toText())
    if (!persona) {
        yield { type: Type.One_Way_Link_In_Profile, profileLinked: personaID }
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
          key: string
          value: unknown
      }
    | {
          type: Type.Invalid_Persona_LinkedProfiles
          of: PersonaIdentifier
          key: string
      }
    | {
          type: Type.Invalid_Profile
          key: string
          value: unknown
      }
    | {
          type: Type.Invalid_Profile_LinkedPersona
          key: unknown
      }
    | {
          type: Type.One_Way_Link_In_Persona
          persona: PersonaIdentifier
          profile: ProfileIdentifier
          profileLined?: unknown
      }
    | {
          type: Type.One_Way_Link_In_Profile
          profileLinked: PersonaIdentifier
      }
