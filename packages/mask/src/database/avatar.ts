/// <reference path="./global.d.ts" />
import { openDB, DBSchema } from 'idb/with-async-ittr-cjs'
import { Identifier, PersonaIdentifier, ProfileIdentifier } from './type'
import { createDBAccess, IDBPSafeTransaction, createTransaction } from './helpers/openDB'

//#region Schema
export type IdentityWithAvatar = ProfileIdentifier | PersonaIdentifier
export type AvatarRecord = ArrayBuffer
interface AvatarMetadataRecord {
    identifier: string
    lastUpdateTime: Date
    lastAccessTime: Date
}
export interface AvatarDBSchema extends DBSchema {
    /** Use out-of-line keys */
    avatars: {
        value: AvatarRecord
        key: string
    }
    /** Key is value.identifier */
    metadata: {
        value: AvatarMetadataRecord
        key: string
    }
}
//#endregion

const db = createDBAccess(() => {
    return openDB<AvatarDBSchema>('maskbook-avatar-cache', 1, {
        upgrade(db, oldVersion, newVersion, transaction) {
            // Out line keys
            db.createObjectStore('avatars')
            db.createObjectStore('metadata', { keyPath: 'identifier' })
        },
    })
})
export const createAvatarDBAccess = db
/**
 * Store avatar into database
 */
export async function storeAvatarDB(id: IdentityWithAvatar, avatar: ArrayBuffer) {
    const meta: AvatarMetadataRecord = {
        identifier: id.toText(),
        lastUpdateTime: new Date(),
        lastAccessTime: new Date(),
    }
    const t = (await db()).transaction(['avatars', 'metadata'], 'readwrite')
    await t.objectStore('avatars').put(avatar, id.toText())
    await t.objectStore('metadata').put(meta)
    return
}
/**
 * Read avatar out
 */
export async function queryAvatarDB(id: IdentityWithAvatar): Promise<ArrayBuffer | null> {
    const t = (await db()).transaction('avatars')
    const result = await t.objectStore('avatars').get(id.toText())
    if (result) {
        updateAvatarMetaDB(id, { lastAccessTime: new Date() }).catch((error: unknown) => {
            console.warn('Update last use record failed', error)
        })
    }
    return result || null
}
/**
 * Store avatar metadata
 */
export async function updateAvatarMetaDB(id: IdentityWithAvatar, newMeta: Partial<AvatarMetadataRecord>) {
    const t = (await db()).transaction('metadata', 'readwrite')
    const meta = await t.objectStore('metadata').get(id.toText())
    const newRecord = Object.assign({}, meta, newMeta)
    await t.objectStore('metadata').put(newRecord)
}
/**
 * Find avatar lastUpdateTime or lastAccessTime out-of-date
 * @param attribute - Which attribute want to query
 * @param deadline - Select all identifiers before a date
 * defaults to 14 days for lastAccessTime
 * defaults to 7 days for lastUpdateTime
 */
export async function queryAvatarOutdatedDB(
    attribute: 'lastUpdateTime' | 'lastAccessTime',
    t?: IDBPSafeTransaction<AvatarDBSchema, ['metadata'], 'readonly'>,
    deadline: Date = new Date(Date.now() - 1000 * 60 * 60 * 24 * (attribute === 'lastAccessTime' ? 14 : 7)),
) {
    t = createTransaction(await db(), 'readonly')('metadata')
    const outdated: IdentityWithAvatar[] = []
    for await (const { value } of t.objectStore('metadata')) {
        if (deadline > value[attribute]) {
            const id = Identifier.fromString(value.identifier)
            if (id.err) continue
            outdated.push(id.val as IdentityWithAvatar)
        }
    }
    return outdated
}
/**
 * Query if the avatar is outdated
 * @param attribute - Which attribute want to query
 * @param deadline - Select all identifiers before a date
 * defaults to 30 days for lastAccessTime
 * defaults to 7 days for lastUpdateTime
 */
export async function isAvatarOutdatedDB(
    identifier: IdentityWithAvatar,
    attribute: 'lastUpdateTime' | 'lastAccessTime',
    deadline: Date = new Date(Date.now() - 1000 * 60 * 60 * 24 * (attribute === 'lastAccessTime' ? 30 : 7)),
): Promise<boolean> {
    const t = (await db()).transaction('metadata')
    const meta = await t.objectStore('metadata').get(identifier.toText())
    if (!meta) return true
    if (deadline > meta[attribute]) return true
    return false
}
/**
 * Batch delete avatars
 */
export async function deleteAvatarsDB(
    ids: IdentityWithAvatar[],
    t?: IDBPSafeTransaction<AvatarDBSchema, ['metadata', 'avatars'], 'readwrite'>,
) {
    t = createTransaction(await db(), 'readwrite')('avatars', 'metadata')
    for (const id of ids) {
        t.objectStore('avatars').delete(id.toText())
        t.objectStore('metadata').delete(id.toText())
    }
    return
}
