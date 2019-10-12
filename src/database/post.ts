/// <reference path="./global.d.ts" />
import { PostIdentifier, PersonIdentifier, Identifier, PostIVIdentifier } from './type'
import { openDB, DBSchema } from 'idb/with-async-ittr'

function outDb(db: PostDBRecordV40ToV38): PostOutDBRecordV40ToV38 {
    const { identifier, ...rest } = db
        // Restore prototype
    ;(rest.recipients || []).forEach(y => Object.setPrototypeOf(y, PersonIdentifier.prototype))
    return {
        ...rest,
        identifier: Identifier.fromString(identifier) as PostIVIdentifier,
    }
}
function toDb(out: PostOutDBRecordV40ToV38): PostDBRecordV40ToV38 {
    return { ...out, identifier: out.identifier.toText() }
}
interface PostOutDBRecordV40ToV38 extends Omit<PostDBRecordV40ToV38, 'identifier'> {
    identifier: PostIVIdentifier
}
interface PostDBRecordV40ToV38 {
    identifier: string
    /**
     * ! This MUST BE a native CryptoKey
     */
    postCryptoKey?: CryptoKey
    version: -40 | -39 | -38
    recipients?: PersonIdentifier[]
}
interface PostDB extends DBSchema {
    /** Use inline keys */
    post: {
        value: PostDBRecordV40ToV38
        key: string
    }
}
const db = openDB<PostDB>('maskbook-post-v2', 2, {
    upgrade(db, oldVersion, newVersion, transaction) {
        if (oldVersion < 1) {
            // inline keys
            db.createObjectStore('post', { keyPath: 'identifier' })
        }
        /**
         * In the version 1 we use PostIdentifier to store post that identified by post iv
         * After upgrade to version 2, we use PostIVIdentifier to store it.
         * So we transform all old data into new data.
         */
        if (oldVersion === 1) {
            const store = transaction.objectStore('post')
            store.getAll().then(values => {
                store.clear()
                for (const each of values) {
                    const id = Identifier.fromString(each.identifier)
                    if (id instanceof PostIdentifier) {
                        each.identifier = new PostIVIdentifier(
                            (id.identifier as PersonIdentifier).network,
                            id.postId,
                        ).toText()
                    }
                    store.add(each)
                }
            })
        }
    },
})
export async function updatePostDB(
    record: Partial<PostOutDBRecordV40ToV38> & Pick<PostOutDBRecordV40ToV38, 'identifier'>,
    mode: 'append' | 'override',
): Promise<void> {
    const _rec = (await queryPostDB(record.identifier)) || { identifier: record.identifier, version: -40 }
    const rec = { ...toDb(_rec), ...record }
    if (mode === 'append') rec.recipients = [...(toDb(_rec).recipients || []), ...(record.recipients || [])]

    const t = (await db).transaction('post', 'readwrite')
    await t.objectStore('post').put(toDb(rec))
}
export async function queryPostDB(record: PostIVIdentifier): Promise<PostOutDBRecordV40ToV38 | null> {
    const t = (await db).transaction('post')
    const result = await t.objectStore('post').get(record.toText())
    if (result) return outDb(result)
    return null
}
export async function deletePostCryptoKeyDB(record: PostIVIdentifier) {
    const t = (await db).transaction('post', 'readwrite')
    await t.objectStore('post').delete(record.toText())
}

declare function backupPostCryptoKeyDB(): Promise<unknown>
