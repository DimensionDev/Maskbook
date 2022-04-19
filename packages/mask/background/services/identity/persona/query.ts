import type { PersonaIdentifier } from '@masknet/shared-base'
import { queryPersonaDB, queryPersonasDB } from '../../../database/persona/db'
import { queryPersonasDB as queryPersonasFromIndexedDB } from '../../../database/persona/web'
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
