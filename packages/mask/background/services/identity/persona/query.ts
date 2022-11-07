import type { MobilePersona } from '@masknet/public-api'
import type { PersonaIdentifier, PersonaInformation, ProfileIdentifier } from '@masknet/shared-base'
import { first, orderBy } from 'lodash-es'
import {
    createPersonaDBReadonlyAccess,
    PersonaRecord,
    queryPersonaDB,
    queryPersonasDB,
    queryProfileDB,
} from '../../../database/persona/db.js'
import { queryPersonasDB as queryPersonasFromIndexedDB } from '../../../database/persona/web.js'
import { toPersonaInformation } from '../../__utils__/convert.js'
import { personaRecordToMobilePersona } from './mobile.js'

export async function mobile_queryPersonaRecordsFromIndexedDB() {
    if (process.env.architecture !== 'app') throw new Error('This function is only available in app')
    return queryPersonasFromIndexedDB()
}

export interface MobileQueryPersonasOptions {
    hasPrivateKey?: boolean
    network?: string
    identifier?: PersonaIdentifier
}
export async function mobile_queryPersonas(options: MobileQueryPersonasOptions): Promise<MobilePersona[]> {
    if (process.env.architecture !== 'app') throw new Error('This function is only available in app')

    const { hasPrivateKey, identifier, network } = options
    const result: PersonaRecord[] = []

    if (identifier === undefined) {
        result.push(...(await queryPersonasDB({ hasPrivateKey })))
    } else {
        const persona = await queryPersonaDB(identifier)
        persona && result.push(persona)
    }

    return result
        .filter((x) => {
            if (!x.privateKey && hasPrivateKey) return false
            if (network && ![...x.linkedProfiles.keys()].some((x) => x.network === network)) return false
            return true
        })
        .map((x) => personaRecordToMobilePersona(x))
}

export async function queryOwnedPersonaInformation(initializedOnly: boolean): Promise<PersonaInformation[]> {
    let result: Promise<PersonaInformation[]>
    await createPersonaDBReadonlyAccess(async (t) => {
        let personas = await queryPersonasDB({ hasPrivateKey: true }, t)
        if (initializedOnly) personas = personas.filter((x) => !x.uninitialized)
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

export async function queryPersona(id: PersonaIdentifier): Promise<undefined | PersonaInformation> {
    let result: Promise<PersonaInformation> | undefined
    await createPersonaDBReadonlyAccess(async (t) => {
        const persona = await queryPersonaDB(id, t)
        if (!persona) return
        result = toPersonaInformation([persona], t).mustNotAwaitThisWithInATransaction.then((x) => first(x)!)
    })
    return result
}
