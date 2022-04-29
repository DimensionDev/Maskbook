import type { Persona } from './types'
import { PersonaRecord, queryPersonaDB } from '../../../background/database/persona/db'
import type { PersonaIdentifier } from '@masknet/shared-base'

export function personaRecordToPersona(record: PersonaRecord): Persona {
    const rec = { ...record }
    delete rec.localKey
    // @ts-ignore
    delete rec.publicKey
    const hasPrivateKey = !!rec.privateKey
    delete rec.privateKey
    return {
        ...rec,
        hasPrivateKey,
        fingerprint: rec.identifier.rawPublicKey,
    }
}

/**
 * Query a persona even it is not stored in the database.
 * @param identifier - Identifier for people want to query
 */
export async function queryPersona(identifier: PersonaIdentifier): Promise<Persona> {
    const _ = await queryPersonaDB(identifier)
    if (_) return personaRecordToPersona(_)
    return {
        identifier,
        createdAt: new Date(),
        updatedAt: new Date(),
        linkedProfiles: new Map(),
        hasPrivateKey: false,
        hasLogout: false,
        fingerprint: identifier.rawPublicKey,
    }
}
