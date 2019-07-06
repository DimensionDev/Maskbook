import { openDB } from 'idb/with-async-ittr'
/**
 * @deprecated
 * ? Webpack mangled the class name that provides to the typed-db lib.
 * ? So the database name is also mangled too.
 * ? This function is used to read out all data in the 1st version of database.
 */
export async function readMangledDB(dbname: string, version: number) {
    const db = await openDB(dbname, version)
    const stores = Array.from(db.objectStoreNames)

    const results = await Promise.all(stores.map(storeName => db.getAll(storeName)))
    return results.reduce((prev, curr) => prev.concat(curr), [])
}
