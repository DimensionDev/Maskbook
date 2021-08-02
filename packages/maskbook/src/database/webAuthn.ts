import { openDB } from 'idb'
import { PersonaIdentifier, CredentialIdentifier } from './type'
import type { DBSchema, IDBPTransaction } from 'idb/with-async-ittr-cjs'
import type { PrototypeLess } from '../utils'
import { createDBAccess } from './helpers/openDB'
import { Identifier } from './type'
import { restorePrototype } from '../utils'

export interface CredentialRecord {
    identifier: CredentialIdentifier
    createdBy: PersonaIdentifier
    createdAt: Date
}

interface WebAuthnDBRecord extends Omit<CredentialRecord, 'identifier' | 'createdBy'> {
    identifier: string
    createdBy: PrototypeLess<PersonaIdentifier>
}

export interface WebAuthnDB extends DBSchema {
    credential: {
        value: WebAuthnDBRecord
        key: string
    }
}

const db = createDBAccess(() => openDB<WebAuthnDB>('masbook-webauthn', 1, {}))

type CredentialTransaction = IDBPTransaction<WebAuthnDB, ['credential']>
export async function upgradeCredentialDB(
    updateRecord: CredentialRecord,
    mode: 'append' | 'override',
    t?: CredentialTransaction,
) {
    t = t || (await db()).transaction('credential', 'readwrite')
    const currentRecord = await queryCredentialDB(updateRecord.identifier)
}

export async function queryCredentialDB(identifier: CredentialIdentifier, t?: CredentialTransaction) {
    t = t || (await db()).transaction('credential')
    const result = await t?.objectStore('credential').get(identifier.toText())
    if (result) return
    return null
}

function credentialOutDB(db: WebAuthnDBRecord): CredentialRecord {
    const { identifier, createdBy, createdAt } = db
    return {
        identifier: Identifier.fromString(identifier, CredentialIdentifier).unwrap(),
        createdBy: restorePrototype(createdBy, PersonaIdentifier[0].prototype),
        createdAt,
    }
}
