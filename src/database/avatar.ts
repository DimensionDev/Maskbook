import { openDB, DBSchema } from 'idb/with-async-ittr'
import { Identifier, PersonIdentifier } from './type'

//#region Schema
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

const db = openDB<AvatarDB>('maskbook-avatar-cache-v2', 1, {
    upgrade(db, oldVersion, newVersion, transaction) {
        // Out line keys
        const avatarStore = db.createObjectStore('avatars')
        const metadataStore = db.createObjectStore('metadata', { keyPath: 'identifier' })
    },
})
/**
 * Store avatar into database
 */
export async function storeAvatarDB(id: Identifier, avatar: ArrayBuffer) {
    const meta: AvatarMetadataRecord = {
        identifier: id.toString(),
        lastUpdateTime: new Date(),
        lastAccessTime: new Date(),
    }
    const t = (await db).transaction(['avatars', 'metadata'], 'readwrite')
    const a = t.objectStore('avatars').put(avatar, id.toString())
    await t.objectStore('metadata').put(meta)
    await a
    return
}
/**
 * Read avatar out
 */
export async function queryAvatarDB(id: PersonIdentifier) {
    const t = (await db).transaction('avatars')
    const result = t.objectStore('avatars').get(id.toString())

    try {
        updateAvatarMetaDB(id, { lastAccessTime: new Date() })
    } catch (e) {}
    return result
}
/**
 * Store avatar metadata
 */
async function updateAvatarMetaDB(id: PersonIdentifier, newMeta: Partial<AvatarMetadataRecord>) {
    const t = (await db).transaction('metadata', 'readwrite')
    const meta = await t.objectStore('metadata').get(id.toString())
    const newRecord = Object.assign({}, meta, newMeta)
    await t.objectStore('metadata').put(newRecord)
    return newRecord
}
/**
 * Find avatar lastUpdateTime or lastAccessTime out-of-date
 * @param deadline - Select all identifiers before a date, defaults to 30 days
 */
export async function queryAvatarOutdatedDB(
    attribute: 'lastUpdateTime' | 'lastAccessTime',
    deadline: Date = new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
) {
    const t = (await db).transaction('metadata')
    const outdated: Identifier[] = []
    // tslint:disable-next-line: await-promise
    for await (const { value } of t.store) {
        if (deadline > value[attribute]) outdated.push(Identifier.fromString(value.identifier)!)
    }
    return outdated
}
/**
 * Batch delete avatars
 */
export async function deleteAvatarsDB(ids: PersonIdentifier[]) {
    const t = (await db).transaction(['avatars', 'metadata'], 'readwrite')
    const promises: Promise<void>[] = []
    for (const id of ids) {
        const a = t.objectStore('avatars').delete(id.toString())
        const b = t.objectStore('metadata').delete(id.toString())
        promises.push(a, b)
    }
    return
}
