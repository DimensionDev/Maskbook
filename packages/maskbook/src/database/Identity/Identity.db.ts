import type { AESJsonWebKey, EC_Private_JsonWebKey, EC_Public_JsonWebKey, IdentityIdentifier } from '@masknet/shared'
import { createDBAccess } from '../helpers/openDB'
import { DBSchema, openDB } from 'idb/with-async-ittr-cjs'

const STORE_NAME = 'identity'

// todo: add comment
export interface IdentityRecord {
    identifier: IdentityIdentifier
    mnemonic?: {
        words: string
        parameter: { path: string; withPassword: boolean }
    }
    publicKey: EC_Public_JsonWebKey
    privateKey?: EC_Private_JsonWebKey
    localKey?: AESJsonWebKey
    createdAt: Date
    updatedAt: Date
    /**
     * create a dummy identity which should hide to the user until
     * connected at least one persona
     */
    uninitialized?: boolean
}

type IdentityRecordDB = Omit<IdentityRecord, 'identifier'> & {
    identifier: string
}

export interface IdentityDBSchema extends DBSchema {
    /** Key is value.identifier */
    identity: {
        value: IdentityRecordDB
        key: string
    }
}

const db = createDBAccess(() => {
    return openDB<IdentityDBSchema>('maskbook-identity', 1, {
        upgrade(db, oldVersion, newVersion, transaction) {
            db.createObjectStore(STORE_NAME, { keyPath: 'identifier' })
        },
    })
})

export async function createIdentityInDB(record: IdentityRecord) {
    const t = (await db()).transaction(STORE_NAME, 'readwrite')
    await t.objectStore(STORE_NAME).add(identityRecordToDB(record))
}

export async function queryIdentity(key: string): Promise<IdentityRecordDB | null> {
    const t = (await db()).transaction(STORE_NAME)
    const result = await t.objectStore(STORE_NAME).get(key)

    return result || null
}

function identityRecordToDB(record: IdentityRecord) {
    return {
        ...record,
        identifier: record.identifier.toText(),
    }
}
