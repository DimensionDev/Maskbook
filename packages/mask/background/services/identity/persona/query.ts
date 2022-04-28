import type { PersonaIdentifier, PersonaInformation, ProfileInformation } from '@masknet/shared-base'
import { first, orderBy } from 'lodash-unified'
import {
    createPersonaDBReadonlyAccess,
    queryPersonaDB,
    queryPersonasDB,
    queryProfilesDB,
} from '../../../database/persona/db'
import { queryPersonasDB as queryPersonasFromIndexedDB } from '../../../database/persona/web'
import { toProfileInformation } from '../../__utils__/convert'
import { MobilePersona, personaRecordToMobilePersona } from './mobile'

export async function mobile_queryPersonaRecordsFromIndexedDB() {
    if (process.env.architecture !== 'app') throw new Error('This function is only available in app')
    return queryPersonasFromIndexedDB()
}

export async function mobile_queryPersonas(
    identifier?: PersonaIdentifier,
    requirePrivateKey = false,
): Promise<MobilePersona[]> {
    if (process.env.architecture !== 'app') throw new Error('This function is only available in app')

    if (typeof identifier === 'undefined')
        return (await queryPersonasDB({ hasPrivateKey: requirePrivateKey })).map((x) => personaRecordToMobilePersona(x))
    const x = await queryPersonaDB(identifier)
    if (!x) return []
    if (!x.privateKey && requirePrivateKey) return []
    return [personaRecordToMobilePersona(x)]
}

export async function queryOwnedPersonaInformation(): Promise<PersonaInformation[]> {
    const result: PersonaInformation[] = []
    const extraPromises: Promise<any>[] = []
    await createPersonaDBReadonlyAccess(async (t) => {
        const personas = await queryPersonasDB({ hasPrivateKey: true }, t)
        for (const persona of personas.sort((a, b) => (a.updatedAt > b.updatedAt ? 1 : -1))) {
            const map: ProfileInformation[] = []
            result.push({
                nickname: persona.nickname,
                identifier: persona.identifier,
                linkedProfiles: map,
            })

            if (persona.linkedProfiles.size) {
                const profiles = await queryProfilesDB({ identifiers: [...persona.linkedProfiles.keys()] }, t)
                // we must not await toProfileInformation cause it is tx of another db.
                extraPromises.push(toProfileInformation(profiles).then((x) => map.push(...x)))
            }
        }
    })
    await Promise.all(extraPromises)
    return result
}

export async function queryLastPersonaCreated(): Promise<PersonaIdentifier | undefined> {
    const all = await queryPersonasDB({ hasPrivateKey: true })
    return first(orderBy(all, (x) => x.createdAt, 'desc'))?.identifier
}
