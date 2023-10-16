import type { IDBPDatabase } from 'idb/with-async-ittr'

export function createDBAccess<DBSchema>(opener: () => Promise<IDBPDatabase<DBSchema>>) {
    let db: IDBPDatabase<DBSchema> | undefined = undefined
    function clean() {
        if (db) {
            db.close()
            db.addEventListener('close', () => (db = undefined), { once: true })
        }
        db = undefined
    }
    return async () => {
        if (db) {
            try {
                // try if the db still open
                const t = db.transaction([db.objectStoreNames[0]], 'readonly', {})
                t.commit()
                return db
            } catch {
                clean()
            }
        }
        db = await opener()
        db.addEventListener('close', clean, { once: true })
        db.addEventListener('error', clean, { once: true })
        return db
    }
}
