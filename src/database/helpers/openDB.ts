import { IDBPDatabase } from 'idb'
import { OnlyRunInContext } from '@holoflows/kit/es'

export function createDBAccess<DBSchema>(opener: () => Promise<IDBPDatabase<DBSchema>>) {
    let db: IDBPDatabase<DBSchema> | undefined = undefined
    return async () => {
        OnlyRunInContext(['background', 'debugging'], 'Database')
        if (db) return db
        db = await opener()
        db.addEventListener('close', e => (db = undefined))
        return db
    }
}
