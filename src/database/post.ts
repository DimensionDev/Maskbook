import { PostIdentifier } from './type'
import { openDB, DBSchema } from 'idb/with-async-ittr'

interface PostDBRecordV40 {
    identifier: PostIdentifier
    postCryptoKey: JsonWebKey
    version: -40
}
interface PostDB extends DBSchema {
    /** Use inline keys */
    post: {
        value: PostDBRecordV40
        key: string
    }
}
const db = openDB<PostDB>('maskbook-post-v2', 1, {
    upgrade(db, oldVersion, newVersion, transaction) {
        // inline keys
        db.createObjectStore('post', { keyPath: 'identifier' })
    },
})
export async function storePostCryptoKeyDB(record: PostDBRecordV40) {
    const t = (await db).transaction('post', 'readwrite')
    const o: typeof record = { ...record, identifier: record.identifier.toString() as any }
    await t.objectStore('post').put(o)
}
export async function queryPostCryptoKeyDB(record: PostIdentifier) {
    const t = (await db).transaction('post')
    return (await t.objectStore('post').get(record.identifier.toString())) || null
}
export async function deletePostCryptoKeyDB(record: PostIdentifier) {
    const t = (await db).transaction('post', 'readwrite')
    return t.objectStore('post').delete(record.identifier.toString())
}
export async function backupPostCryptoKeyDB() {
    throw new Error('Not implemented')
}
