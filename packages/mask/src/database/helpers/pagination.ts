import type { DBSchema, IDBPCursorWithValueIteratorValue, StoreNames } from 'idb/with-async-ittr'
import type { IDBPSafeTransaction } from '../../../background/database/utils/openDB'

export async function queryTransactionPaged<
    DBType extends DBSchema,
    TxStores extends StoreNames<DBType>[],
    Mode extends 'readonly' | 'readwrite',
    RecordType extends IDBPCursorWithValueIteratorValue<DBType, TxStores, TxStores[0], unknown>['value'],
>(
    t: IDBPSafeTransaction<DBType, TxStores, Mode>,
    storeName: TxStores[0],
    options: {
        skip: number
        count: number
        predicate?: (record: RecordType) => boolean
    },
) {
    const { skip, count, predicate } = options
    let skipped = 0
    let read = 0
    const data: RecordType[] = []
    for await (const record of t.objectStore(storeName).iterate()) {
        if (skipped < skip) {
            skipped += 1
            continue
        }
        if (read < count && (predicate?.(record.value) ?? true)) {
            read += 1
            data.push(record.value)
            continue
        }
    }
    return data
}
