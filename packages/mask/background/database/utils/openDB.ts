import type {
    IDBPDatabase,
    DBSchema,
    StoreNames,
    IDBPTransaction,
    IDBPObjectStore,
    IDBPCursorWithValueIteratorValue,
} from 'idb/with-async-ittr-cjs'
import { assertEnvironment, Environment } from '@dimensiondev/holoflows-kit'
import { MaskMessages } from '../../../shared'

const iOSFix =
    process.env.engine === 'safari' ? import('safari-14-idb-fix').then(({ default: ready }) => ready()) : undefined
export function createDBAccess<DBSchema>(opener: () => Promise<IDBPDatabase<DBSchema>>) {
    let db: IDBPDatabase<DBSchema> | undefined = undefined
    if (process.env.engine === 'safari') {
        // iOS bug: indexedDB dies randomly
        MaskMessages.events.mobile_app_suspended.on(clean)
        setInterval(clean, /** 1 min */ 1000 * 60)
    }
    function clean() {
        if (db) {
            db.close()
            db.addEventListener('close', () => (db = undefined), { once: true })
        }
        db = undefined
    }
    return async () => {
        await iOSFix
        assertEnvironment(Environment.ManifestBackground)
        if (db) {
            try {
                // try if the db still open
                db.transaction([], 'readonly', {})
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
export function createDBAccessWithAsyncUpgrade<DBSchema, AsyncUpgradePreparedData>(
    firstVersionThatRequiresAsyncUpgrade: number,
    latestVersion: number,
    opener: (currentTryOpenVersion: number, knowledge?: AsyncUpgradePreparedData) => Promise<IDBPDatabase<DBSchema>>,
    asyncUpgradePrepare: (db: IDBPDatabase<DBSchema>) => Promise<AsyncUpgradePreparedData | undefined>,
) {
    let db: IDBPDatabase<DBSchema> | undefined = undefined
    if (process.env.engine === 'safari') {
        // iOS bug: indexedDB dies randomly
        MaskMessages.events.mobile_app_suspended.on(clean)
        setInterval(clean, /** 1 min */ 1000 * 60)
    }
    function clean() {
        if (db) {
            db.close()
            db.addEventListener('close', () => (pendingOpen = db = undefined), { once: true })
        }
        pendingOpen = db = undefined
    }
    let pendingOpen: Promise<IDBPDatabase<DBSchema>> | undefined
    async function open(): Promise<IDBPDatabase<DBSchema>> {
        await iOSFix
        assertEnvironment(Environment.ManifestBackground)
        if (db?.version === latestVersion) return db
        let currentVersion = firstVersionThatRequiresAsyncUpgrade
        let lastVersionData: AsyncUpgradePreparedData | undefined = undefined
        while (currentVersion < latestVersion) {
            try {
                db = await opener(currentVersion, lastVersionData)
                // if the open success, the stored version is small or eq than currentTryOpenVersion
                // let's call the prepare function to do all the async jobs
                lastVersionData = await asyncUpgradePrepare(db)
            } catch (error) {
                if (currentVersion >= latestVersion) throw error
                // if the stored database version is bigger than the currentTryOpenVersion
                // It will fail and we just move to next version
            }
            currentVersion += 1
            db?.close()
            db = undefined
        }
        db = await opener(currentVersion, lastVersionData)
        db.addEventListener('close', (e) => (db = undefined), { once: true })
        if (!db) throw new Error('Invalid state')
        return db
    }
    return () => {
        // Share a Promise to prevent async upgrade for multiple times
        if (pendingOpen) return pendingOpen
        const promise = (pendingOpen = open())
        promise.catch(() => (pendingOpen = undefined))
        return promise
    }
}
export interface IDBPSafeObjectStore<
    DBTypes extends DBSchema,
    TxStores extends StoreNames<DBTypes>[] = StoreNames<DBTypes>[],
    StoreName extends StoreNames<DBTypes> = StoreNames<DBTypes>,
> extends Omit<
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
    Mode extends 'readonly' | 'readwrite',
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
    return <UsedStoreName extends StoreNames<DBType>[] = []>(...storeNames: UsedStoreName) => {
        return db.transaction(storeNames, mode) as IDBPSafeTransaction<DBType, UsedStoreName, Mode>
    }
}
