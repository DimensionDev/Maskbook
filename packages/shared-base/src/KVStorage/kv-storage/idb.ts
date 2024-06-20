import { None, Some } from 'ts-results-es'
import { type IDBPDatabase, openDB } from 'idb'
import type { KVStorageBackend } from './types.js'

/**
 * Create a KVStorageBackend that stores the data in the indexedDB
 * @param dbName The database name to use.
 * @param onChange When the database receives a change. onChange should broadcast this to all clients.
 * @param beforeAutoSync The promise to wait before the auto-sync starts.
 * @returns A KVStorageBackend
 */
export function createIndexedDB_KVStorageBackend(
    dbName: string,
    onChange: (key: string, value: unknown) => void,
    beforeAutoSync = Promise.resolve(),
): KVStorageBackend {
    let db: IDBPDatabase | undefined

    setInterval(() => {
        if (!db) return
        db.close()
        db = undefined
    }, 1000 * 60)

    async function ensureDB() {
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
