import type { IDBPTransaction } from 'idb/build/cjs'
import { createPluginDBAccess, PluginDatabase, pluginDataHasValidKeyPath, toStore } from '.'

type IndexableTaggedUnion = {
    type: string | number
    id: string | number
}
/**
 * @typeParameter Data It should be a [tagged union](https://en.wikipedia.org/wiki/Tagged_union) with an extra `id` field
 * @param plugin_id Plugin ID
 * @returns The database
 * @example
 *
 * type File = { type: 'file'; name: string; id: string }
 * type Folder = { type: 'folder'; file: string[]; id: string }
 * const pluginDatabase = createPluginDatabase<File | Folder>('id')
 * const file: File = { type: 'file', name: 'file.txt', id: uuid() }
 * const folder: Folder = { type: 'folder', file: [file.id], id: uuid() }
 * // Add new data
 * await pluginDatabase.add(file)
 * await pluginDatabase.add(folder)
 * // Remove
 * await pluginDatabase.remove('file', file.id)
 * // Query
 * const result: File | undefined = await pluginDatabase.get('file', file.id)
 * const has: boolean = await pluginDatabase.has('file', file.id)
 * // iterate
 * for await (const i of pluginDatabase.iterate('file')) {
 *     // read only during the for...await loop
 *     // !! NO: await pluginDatabase.remove('file', file.id)
 *     console.log(i.name)
 * }
 * for await (const i of pluginDatabase.iterate_mutate('folder')) {
 *     i.data // Folder
 *     await i.update({ ...i.data, file: [] })
 *     await i.delete()
 * }
 */
export function createPluginDatabase<Data extends IndexableTaggedUnion>(plugin_id: string) {
    type Type = Data['type']
    type Of<K extends Type> = Data & {
        type: K
    }
    type ID<K extends Type> = Of<K>['id']
    let livingTransaction: IDBPTransaction<PluginDatabase, ['PluginStore']> | undefined = undefined
    function key(data: IndexableTaggedUnion) {
        return IDBKeyRange.only([plugin_id, data.type, data.id])
    }
    return {
        // Please keep the API minimal
        /**
         * Query an object from the database
         * @param type "type" field on the object
         * @param id "id" field on the object
         */
        async get<T extends Type>(type: T, id: ID<T>): Promise<Of<T> | undefined> {
            const t = await c('r')
            const data = await t.store.get(key({ type, id }))
            if (!data) return undefined
            return data.value as Of<T>
        },
        async has<T extends Type>(type: T, id: ID<T>): Promise<boolean> {
            const t = await c('r')
            const count = await t.store.count(key({ type, id }))
            return count > 0
        },
        /**
         * Store a data into the database.
         * @param data Must be an object with "type" and "id"
         */
        async add(data: Data): Promise<void> {
            const t = await c('rw')
            if (!pluginDataHasValidKeyPath(data)) throw new TypeError("Data doesn't have a valid key path")
            if (await t.store.get(key(data))) await t.store.put(toStore(plugin_id, data))
            else await t.store.add(toStore(plugin_id, data))
        },
        /**
         * Remove an object from the database
         * @param type "type" field on the object
         * @param id "id" field on the object
         */
        async remove<T extends Type>(type: T, id: ID<T>): Promise<void> {
            return (await c('rw')).store.delete(key({ type, id }))
        },
        /**
         * Iterate over the database of given type (readonly!)
         *
         * !!! During the iterate, you MUST NOT do anything that writes to the store (use iterate_mutate instead)
         * !!! You MUST NOT do anything asynchronous before the iterate ends
         *
         * !!! Otherwise the transaction will be inactivate
         * @param type "type" field on the object
         */
        async *iterate<T extends Type>(type: T) {
            const db = await c('r')
            const cursor = await db
                .objectStore('PluginStore')
                .index('type')
                .openCursor(IDBKeyRange.only([plugin_id, type]))
            if (!cursor) return
            for await (const each of cursor) {
                yield each.value.value as Of<T>
            }
        },
        /**
         * Iterate over the database of given type (read-write).
         *
         * !!! You MUST NOT do anything asynchronous before the iterate ends
         *
         * !!! Otherwise the transaction will be inactivate
         * @param type "type" field on the object
         */
        async *iterate_mutate<T extends Type>(type: T) {
            const cursor = await (
                await c('rw')
            )
                .objectStore('PluginStore')
                .index('type')
                .openCursor(IDBKeyRange.only([plugin_id, type]))
            if (!cursor) return
            for await (const each of cursor) {
                yield {
                    data: each.value.value as Of<T>,
                    delete: () => each.delete(),
                    update: (data: Of<T>) => each.update(toStore(plugin_id, data)),
                }
            }
        },
    }
    async function c(usage: 'r' | 'rw'): Promise<NonNullable<typeof livingTransaction>> {
        if (usage === 'rw' && livingTransaction?.mode === 'readonly') invalidateTransaction()
        try {
            await livingTransaction?.store.openCursor()
        } catch {
            invalidateTransaction()
        }
        if (livingTransaction === undefined) {
            const db = await createPluginDBAccess()
            const tx = db.transaction('PluginStore', usage === 'r' ? 'readonly' : 'readwrite')
            livingTransaction = tx
            // Oops, workaround for https://bugs.webkit.org/show_bug.cgi?id=216769 or https://github.com/jakearchibald/idb/issues/201
            try {
                await tx.store.openCursor()
            } catch {
                livingTransaction = db.transaction('PluginStore', usage === 'r' ? 'readonly' : 'readwrite')
                return livingTransaction
            }
            return tx
        }
        return livingTransaction
    }
    function invalidateTransaction() {
        livingTransaction = undefined
    }
}
