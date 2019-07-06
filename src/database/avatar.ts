/// <reference path="./global.d.ts" />
import { openDB, DBSchema } from 'idb/with-async-ittr'
import { Identifier, PersonIdentifier, GroupIdentifier } from './type'

//#region Schema
type IdentityWithAvatar = PersonIdentifier | GroupIdentifier
export type AvatarRecord = ArrayBuffer
interface AvatarMetadataRecord {
    identifier: string
    lastUpdateTime: Date
    lastAccessTime: Date
}
interface AvatarDB extends DBSchema {
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

const db = openDB<AvatarDB>('maskbook-avatar-cache', 1, {
    upgrade(db, oldVersion, newVersion, transaction) {
        // Out line keys
        const avatarStore = db.createObjectStore('avatars')
        const metadataStore = db.createObjectStore('metadata', { keyPath: 'identifier' })
    },
})
/**
 * Store avatar into database
 */
export async function storeAvatarDB(id: IdentityWithAvatar, avatar: ArrayBuffer) {
    const meta: AvatarMetadataRecord = {
        identifier: id.toText(),
        lastUpdateTime: new Date(),
        lastAccessTime: new Date(),
    }
    const t = (await db).transaction(['avatars', 'metadata'], 'readwrite')
    const a = t.objectStore('avatars').put(avatar, id.toText())
    await t.objectStore('metadata').put(meta)
    await a
    return
}
/**
 * Read avatar out
 */
export async function queryAvatarDB(id: IdentityWithAvatar): Promise<ArrayBuffer | null> {
    const t = (await db).transaction('avatars')
    const result = await t.objectStore('avatars').get(id.toText())
    if (result) {
        updateAvatarMetaDB(id, { lastAccessTime: new Date() }).catch(e => {
            console.warn('Update last use record failed', e)
        })
    }
    return result || null
}
/**
 * Store avatar metadata
 */
export async function updateAvatarMetaDB(id: IdentityWithAvatar, newMeta: Partial<AvatarMetadataRecord>) {
    const t = (await db).transaction('metadata', 'readwrite')
    const meta = await t.objectStore('metadata').get(id.toText())
    const newRecord = Object.assign({}, meta, newMeta)
    await t.objectStore('metadata').put(newRecord)
}
/**
 * Find avatar lastUpdateTime or lastAccessTime out-of-date
 * @param attribute - Which attribute want to query
 * @param deadline - Select all identifiers before a date
 * defaults to 30 days for lastAccessTime
 * defaults to 7 days for lastUpdateTime
 */
export async function queryAvatarOutdatedDB(
    attribute: 'lastUpdateTime' | 'lastAccessTime',
    deadline: Date = new Date(Date.now() - 1000 * 60 * 60 * 24 * (attribute === 'lastAccessTime' ? 30 : 7)),
) {
    const t = (await db).transaction('metadata')
    const outdated: IdentityWithAvatar[] = []
    // tslint:disable-next-line: await-promise
    for await (const { value } of t.store) {
        if (deadline > value[attribute]) outdated.push(Identifier.fromString(value.identifier) as IdentityWithAvatar)
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
    identifier: PersonIdentifier | GroupIdentifier,
    attribute: 'lastUpdateTime' | 'lastAccessTime',
    deadline: Date = new Date(Date.now() - 1000 * 60 * 60 * 24 * (attribute === 'lastAccessTime' ? 30 : 7)),
): Promise<boolean> {
    const t = (await db).transaction('metadata')
    const meta = await t.objectStore('metadata').get(identifier.toText())
    if (!meta) return true
    if (deadline > meta[attribute]) return true
    return false
}
/**
 * Batch delete avatars
 */
export async function deleteAvatarsDB(ids: IdentityWithAvatar[]) {
    const t = (await db).transaction(['avatars', 'metadata'], 'readwrite')
    const promises: Promise<void>[] = []
    for (const id of ids) {
        const a = t.objectStore('avatars').delete(id.toText())
        const b = t.objectStore('metadata').delete(id.toText())
        promises.push(a, b)
    }
    return
}
