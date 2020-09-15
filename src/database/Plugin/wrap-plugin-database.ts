import type { IDBPTransaction } from 'idb/build/cjs'
import { calculateKey, createPluginDBAccess, PluginDatabase, toStore } from '.'

type IndexableTaggedUnion = { type: string | number; id: string | number }
export function createPluginDatabase<Data extends IndexableTaggedUnion>(plugin_id: string) {
    type Type = Data['type']
    type Of<K extends Type> = Data & {
        type: K
    }
    type ID<K extends Type> = Of<K>['id']
    let livingIndexedDBTransaction: IDBPTransaction<PluginDatabase, ['PluginStore']> | undefined = undefined
    return {
        // Please keep the API minimal
        /**
         * Query an object from the database
         * @param type "type" field on the object
         * @param id "id" field on the object
         */
        async get<T extends Type>(type: T, id: ID<T>): Promise<Of<T> | undefined> {
            const t = await c('r')
            const data = await t.store.get(calculateKey(plugin_id, { type, id }))
            if (!data) return undefined
            return data.value as any
        },
        /**
         * Store a data into the database.
         * @param data Must be an object with "type" and "id"
         */
        async add(data: Data): Promise<void> {
            const t = await c('rw')
            const key = calculateKey(plugin_id, data)
            if (await t.store.get(key)) await t.store.add(toStore(plugin_id, data), key)
            else await t.store.put(toStore(plugin_id, data), key)
        },
        /**
         * Remove an object from the database
         * @param type "type" field on the object
         * @param id "id" field on the object
         */
        async remove<T extends Type>(type: T, id: ID<T>): Promise<void> {
            const key = calculateKey(plugin_id, { type, id })
            await (await c('rw')).store.delete(key)
        },
        /**
         * Iterate over the database of given type (readonly!)
         * @param type "type" field on the object
         */
        async *iterate<T extends Type>(type: T) {
            for await (const each of (await c('r')).objectStore('PluginStore')) {
                if (each.value.plugin_id !== plugin_id) continue
                if (each.value.type !== type) continue
                yield each.value.value as Of<T>
            }
        },
        /**
         * Iterate over the database of given type (modifiable)
         * @param type "type" field on the object
         */
        async *iterate_mutate<T extends Type>(type: T) {
            for await (const each of (await c('rw')).objectStore('PluginStore')) {
                if (each.value.plugin_id !== plugin_id) continue
                if (each.value.type !== type) continue
                yield {
                    data: each.value.value as Of<T>,
                    delete: () => each.delete(),
                    update: (data: Of<T>) => each.update(toStore(plugin_id, data)),
                }
            }
        },
    }
    async function c(usage: 'r' | 'rw'): Promise<NonNullable<typeof livingIndexedDBTransaction>> {
        if (usage === 'rw' && livingIndexedDBTransaction?.mode === 'readonly') {
            livingIndexedDBTransaction = undefined
        }
        if (livingIndexedDBTransaction === undefined) {
            const db = await createPluginDBAccess()
            const tx = db.transaction('PluginStore', usage === 'r' ? 'readonly' : 'readwrite')
            livingIndexedDBTransaction = tx
            tx.addEventListener('complete', cleanup)
            tx.addEventListener('abort', cleanup)
            tx.addEventListener('error', cleanup)
            return tx
            function cleanup(this: typeof tx) {
                if (livingIndexedDBTransaction === this) livingIndexedDBTransaction = undefined
            }
        }
        return livingIndexedDBTransaction
    }
}
