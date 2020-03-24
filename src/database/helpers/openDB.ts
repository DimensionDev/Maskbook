import type {
    IDBPDatabase,
    DBSchema,
    StoreNames,
    IDBPTransaction,
    IDBPObjectStore,
    IDBPCursorWithValueIteratorValue,
} from 'idb/with-async-ittr'
import { OnlyRunInContext } from '@holoflows/kit/es'

export function createDBAccess<DBSchema>(opener: () => Promise<IDBPDatabase<DBSchema>>) {
    let db: IDBPDatabase<DBSchema> | undefined = undefined
    return async () => {
        OnlyRunInContext(['background', 'debugging'], 'Database')
        if (db) return db
        db = await opener()
        db.addEventListener('close', (e) => (db = undefined))
        return db
    }
}
export interface IDBPSafeObjectStore<
    DBTypes extends DBSchema,
    TxStores extends StoreNames<DBTypes>[] = StoreNames<DBTypes>[],
    StoreName extends StoreNames<DBTypes> = StoreNames<DBTypes>
>
    extends Omit<
        IDBPObjectStore<DBTypes, TxStores, StoreName> /** createIndex is only available in versionchange transaction */,
        | 'createIndex'
        /** deleteIndex is only available in versionchange transaction */
        | 'deleteIndex'
        | 'transaction'
    > {
    [Symbol.asyncIterator](): AsyncIterableIterator<IDBPCursorWithValueIteratorValue<DBTypes, TxStores, StoreName>>
}
export type IDBPSafeTransaction<
    DBTypes extends DBSchema,
    TxStores extends StoreNames<DBTypes>[],
    Mode extends 'readonly' | 'readwrite'
> = Omit<IDBPTransaction<DBTypes, TxStores>, 'objectStoreNames' | 'objectStore' | 'store'> & {
    __writable__?: Mode extends 'readwrite' ? true : boolean
    __stores__?: Record<
        TxStores extends readonly (infer ValueOfUsedStoreName)[]
            ? ValueOfUsedStoreName extends string | number | symbol
                ? ValueOfUsedStoreName
                : never
            : never,
        never
    >
    objectStore<StoreName extends TxStores[number]>(
        name: StoreName,
    ): IDBPSafeObjectStore<DBTypes, StoreName[], StoreName>
}

export function createTransaction<DBType extends DBSchema, Mode extends 'readonly' | 'readwrite'>(
    db: IDBPDatabase<DBType>,
    mode: Mode,
) {
    // It must be a high order function to infer the type of UsedStoreName correctly.
    return <UsedStoreName extends StoreNames<DBType>[] = []>(
        ...storeNames: UsedStoreName
    ): IDBPSafeTransaction<DBType, UsedStoreName, Mode> => {
        return db.transaction(storeNames, mode) as any
    }
}
