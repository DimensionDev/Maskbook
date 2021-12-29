import { openDB, DBSchema } from 'idb/with-async-ittr'
import { Identifier, IdentifierMap, PersonaIdentifier, ProfileIdentifier } from '@masknet/shared-base'
import { createDBAccess, createTransaction, IDBPSafeTransaction } from '../utils/openDB'

const pendingUpdate = new IdentifierMap<IdentifierWithAvatar, Partial<AvatarMetadataRecord>>(new Map())
let pendingUpdateTimer: ReturnType<typeof setTimeout> | null

//#region Schema
export type IdentifierWithAvatar = ProfileIdentifier | PersonaIdentifier
type AvatarRecord = ArrayBuffer
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
export const createAvatarDBAccess = createDBAccess(() => {
    return openDB<AvatarDBSchema>('maskbook-avatar-cache', 1, {
        upgrade(db, oldVersion, newVersion, transaction) {
            // Out line keys
            db.createObjectStore('avatars')
            db.createObjectStore('metadata', { keyPath: 'identifier' })
        },
    })
})
/**
 * Store avatar into database
 */
export async function storeAvatarDB(
    t: IDBPSafeTransaction<AvatarDBSchema, ['metadata', 'avatars'], 'readwrite'>,
    id: IdentifierWithAvatar,
    avatar: ArrayBuffer,
): Promise<void> {
    const meta: AvatarMetadataRecord = {
        identifier: id.toText(),
        lastUpdateTime: new Date(),
        lastAccessTime: new Date(),
    }
    await t.objectStore('avatars').put(avatar, id.toText())
    await t.objectStore('metadata').put(meta)
}
/**
 * Read avatar out
 */
export async function queryAvatarDB(
    t: IDBPSafeTransaction<AvatarDBSchema, ['avatars'], 'readonly'>,
    id: IdentifierWithAvatar,
): Promise<ArrayBuffer | null> {
    const result = await t.objectStore('avatars').get(id.toText())
    if (result) scheduleAvatarMetaUpdate(id, { lastAccessTime: new Date() })
    return result || null
}
function scheduleAvatarMetaUpdate(id: IdentifierWithAvatar, meta: Partial<AvatarMetadataRecord>) {
    pendingUpdate.set(id, meta)

    if (pendingUpdateTimer) return
    const _1_minute = 60 * 1000
    pendingUpdateTimer = setTimeout(async () => {
        try {
            const t = createTransaction(await createAvatarDBAccess(), 'readwrite')('metadata')
            for (const [id, meta] of pendingUpdate) {
                const old = await t.objectStore('metadata').get(id.toText())
                await t.objectStore('metadata').put({ ...old, ...meta } as AvatarMetadataRecord)
            }
        } finally {
            pendingUpdateTimer = null
            pendingUpdate.clear()
        }
    }, _1_minute)
}

/**
 * Find avatar lastUpdateTime or lastAccessTime out-of-date
 * @param attribute - Which attribute want to query
 * @param deadline - Select all identifiers before a date
 * defaults to 14 days for lastAccessTime
 * defaults to 7 days for lastUpdateTime
 * @internal
 */
export async function queryAvatarOutdatedDB(
    t: IDBPSafeTransaction<AvatarDBSchema, ['metadata'], 'readonly'>,
    attribute: 'lastUpdateTime' | 'lastAccessTime',
    deadline: Date = new Date(Date.now() - 1000 * 60 * 60 * 24 * (attribute === 'lastAccessTime' ? 14 : 7)),
) {
    const outdated: IdentifierWithAvatar[] = []
    for await (const { value } of t.objectStore('metadata')) {
        if (deadline > value[attribute]) {
            const id = Identifier.fromString(value.identifier)
            if (id.err) continue
            outdated.push(id.val as IdentifierWithAvatar)
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
 * @internal
 */
export async function isAvatarOutdatedDB(
    t: IDBPSafeTransaction<AvatarDBSchema, ['metadata'], 'readonly'>,
    identifier: IdentifierWithAvatar,
    attribute: 'lastUpdateTime' | 'lastAccessTime',
    deadline: Date = new Date(Date.now() - 1000 * 60 * 60 * 24 * (attribute === 'lastAccessTime' ? 30 : 7)),
): Promise<boolean> {
    const meta = await t.objectStore('metadata').get(identifier.toText())
    if (!meta) return true
    if (deadline > meta[attribute]) return true
    return false
}
/**
 * Batch delete avatars
 * @internal
 */
export async function deleteAvatarsDB(
    t: IDBPSafeTransaction<AvatarDBSchema, ['metadata', 'avatars'], 'readwrite'>,
    ids: IdentifierWithAvatar[],
): Promise<void> {
    for (const id of ids) {
        t.objectStore('avatars').delete(id.toText())
        t.objectStore('metadata').delete(id.toText())
    }
}
