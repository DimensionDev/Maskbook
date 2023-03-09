import type {
    IDBPDatabase,
    DBSchema,
    StoreNames,
    IDBPTransaction,
    IDBPObjectStore,
    TypedDOMStringList,
    IDBPCursorWithValueIteratorValue,
    StoreKey,
    IndexNames,
    IDBPIndex,
    IDBPCursorWithValue,
    IDBPCursor,
} from 'idb/with-async-ittr'

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

export interface IDBPSafeObjectStore<
    DBTypes extends DBSchema,
    TxStores extends Array<StoreNames<DBTypes>> = Array<StoreNames<DBTypes>>,
    StoreName extends StoreNames<DBTypes> = StoreNames<DBTypes>,
    Writable extends boolean = boolean,
> extends Pick<
        IDBPObjectStore<DBTypes, TxStores, StoreName>,
        'get' | 'getAll' | 'getAllKeys' | 'getKey' | 'count' | 'autoIncrement' | 'indexNames' | 'keyPath' | 'name'
    > {
    add: Writable extends true ? IDBPObjectStore<DBTypes, TxStores, StoreName, 'readwrite'>['add'] : unknown
    clear: Writable extends true ? IDBPObjectStore<DBTypes, TxStores, StoreName, 'readwrite'>['clear'] : unknown
    delete: Writable extends true ? IDBPObjectStore<DBTypes, TxStores, StoreName, 'readwrite'>['delete'] : unknown
    put: Writable extends true ? IDBPObjectStore<DBTypes, TxStores, StoreName, 'readwrite'>['put'] : unknown

    index<IndexName extends IndexNames<DBTypes, StoreName>>(
        name: IndexName,
    ): IDBPIndex<DBTypes, TxStores, StoreName, IndexName, Writable extends true ? 'readwrite' : 'readonly'>
    openCursor(
        query?: StoreKey<DBTypes, StoreName> | IDBKeyRange | null,
        direction?: IDBCursorDirection,
    ): Promise<IDBPCursorWithValue<
        DBTypes,
        TxStores,
        StoreName,
        unknown,
        Writable extends true ? 'readwrite' : 'readonly'
    > | null>

    openKeyCursor(
        query?: StoreKey<DBTypes, StoreName> | IDBKeyRange | null,
        direction?: IDBCursorDirection,
    ): Promise<IDBPCursor<
        DBTypes,
        TxStores,
        StoreName,
        unknown,
        Writable extends true ? 'readwrite' : 'readonly'
    > | null>

    [Symbol.asyncIterator](): AsyncIterableIterator<
        IDBPCursorWithValueIteratorValue<
            DBTypes,
            TxStores,
            StoreName,
            unknown,
            Writable extends true ? 'readwrite' : 'readonly'
        >
    >
    iterate(
        query?: StoreKey<DBTypes, StoreName> | IDBKeyRange | null,
        direction?: IDBCursorDirection,
    ): AsyncIterableIterator<
        IDBPCursorWithValueIteratorValue<
            DBTypes,
            TxStores,
            StoreName,
            unknown,
            Writable extends true ? 'readwrite' : 'readonly'
        >
    >
}
export type IDBPSafeTransaction<
    DBTypes extends DBSchema,
    TxStores extends Array<StoreNames<DBTypes>>,
    Mode extends IDBTransactionMode = 'readonly',
> = Omit<IDBPTransaction<DBTypes, TxStores, Mode>, 'mode' | 'objectStoreNames' | 'objectStore' | 'store'> & {
    readonly objectStoreNames: TypedDOMStringList<StoreNames<DBTypes> & string>
    readonly mode: IDBTransactionMode
    readonly __writable__?: Mode extends 'readwrite' ? true : boolean
    readonly __stores__?: Record<
        TxStores extends ReadonlyArray<infer ValueOfUsedStoreName>
            ? ValueOfUsedStoreName extends string | number | symbol
                ? ValueOfUsedStoreName
                : never
            : never,
        never
    >
    objectStore<StoreName extends TxStores[number]>(
        name: StoreName,
    ): IDBPSafeObjectStore<DBTypes, StoreName[], StoreName, Mode extends 'readonly' ? boolean : true>
}

export function createTransaction<DBType extends DBSchema, Mode extends 'readonly' | 'readwrite'>(
    db: IDBPDatabase<DBType>,
    mode: Mode,
) {
    // It must be a high order function to infer the type of UsedStoreName correctly.
    return <UsedStoreName extends Array<StoreNames<DBType>> = []>(...storeNames: UsedStoreName) => {
        return db.transaction(storeNames, mode) as IDBPSafeTransaction<DBType, UsedStoreName, Mode>
    }
}
