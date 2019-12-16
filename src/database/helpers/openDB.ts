import { IDBPDatabase } from 'idb'

export function createDBAccess<DBSchema>(opener: () => Promise<IDBPDatabase<DBSchema>>) {
    let db: IDBPDatabase<DBSchema> | undefined = undefined
    return async () => {
        if (db) return db
        db = await opener()
        db.addEventListener('close', e => (db = undefined))
        return db
    }
}
