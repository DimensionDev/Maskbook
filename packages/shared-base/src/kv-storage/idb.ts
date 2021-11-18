import type { KVStorageBackend } from './types'
import { IDBPDatabase, openDB } from 'idb'
import { None, Some } from 'ts-results'
import Safari14Fix from 'safari-14-idb-fix'

export function createIndexedDB_KVStorageBackend(
    dbName: string,
    onChange: (key: string, value: unknown) => void,
    beforeAutoSync = Promise.resolve(),
): KVStorageBackend {
    let db: IDBPDatabase | undefined

    async function ensureDB() {
        await Safari14Fix()
        if (!db) db = await initDB()
        return db
    }
    function initDB() {
        return openDB(dbName, 1, {
            upgrade(db, oldVersion, newVersion, transaction) {
                db.createObjectStore('store')
            },
        })
    }

    return {
        beforeAutoSync,
        async getValue(key) {
            const db = await ensureDB()
            const t = db.transaction('store', 'readonly')
            if ((await t.store.count(key)) === 0) return None
            return Some(await t.store.get(key))
        },
        async setValue(key, value) {
            const db = await ensureDB()
            const t = db.transaction('store', 'readwrite')
            await t.store.put(value, key)
            onChange(key, value)
        },
    }
}
