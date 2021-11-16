import type { KVStorageBackend } from '.'
import { IDBPDatabase, openDB } from 'idb'
export function createIndexedDB_KVStorageBackend(dbName: string, beforeAutoSync = Promise.resolve()): KVStorageBackend {
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
            return db.transaction('store', 'readonly').store.get(key)
        },
        async setValue(key, value) {
            const db = await ensureDB()
            const t = db.transaction('store', 'readwrite')
            await t.store.put(value, key)
        },
    }
}
