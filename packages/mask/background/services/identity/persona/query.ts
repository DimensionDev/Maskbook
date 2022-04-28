import type { PersonaIdentifier, PersonaInformation, ProfileIdentifier } from '@masknet/shared-base'
import { first, orderBy } from 'lodash-unified'
import {
    createPersonaDBReadonlyAccess,
    queryPersonaDB,
    queryPersonasDB,
    queryProfileDB,
} from '../../../database/persona/db'
import { queryPersonasDB as queryPersonasFromIndexedDB } from '../../../database/persona/web'
import { toPersonaInformation } from '../../__utils__/convert'
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
    let result: Promise<PersonaInformation[]>
    await createPersonaDBReadonlyAccess(async (t) => {
        const personas = await queryPersonasDB({ hasPrivateKey: true }, t)
        result = toPersonaInformation(personas, t).mustNotAwaitThisWithInATransaction
    })
    return result!
}

export async function queryLastPersonaCreated(): Promise<PersonaIdentifier | undefined> {
    const all = await queryPersonasDB({ hasPrivateKey: true })
    return first(orderBy(all, (x) => x.createdAt, 'desc'))?.identifier
}

export async function queryPersonaByProfile(id: ProfileIdentifier): Promise<PersonaInformation | undefined> {
    let result: Promise<PersonaInformation> | undefined
    await createPersonaDBReadonlyAccess(async (t) => {
        const profile = await queryProfileDB(id, t)
        if (!profile?.linkedPersona) return
        const persona = await queryPersonaDB(profile.linkedPersona, t)
        if (!persona) return
        result = toPersonaInformation([persona], t).mustNotAwaitThisWithInATransaction.then((x) => first(x)!)
    })
    return result
}
