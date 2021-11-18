import type { IDBPTransaction } from 'idb/build/cjs'
import type { Plugin, IndexableTaggedUnion } from '@masknet/plugin-infra'
import { createPluginDBAccess, PluginDatabase, pluginDataHasValidKeyPath, toStore } from '.'

/**
 * Avoid calling it directly.
 *
 * You should get the instance from WorkerContext when the plugin is initialized.
 *
 * ```ts
 * let storage: Plugin.Worker.Storage<T | T2> | null = null
 * const worker: Plugin.Worker.Definition = {
 *     ...base,
 *     init(signal, context) {
 *         storage = context.getDatabaseStorage()
 *         // get it here, instance of calling this function directly.
 *     },
 * }
 * ```
 */
export function createPluginDatabase<Data extends IndexableTaggedUnion>(
    plugin_id: string,
    signal?: AbortSignal,
): Plugin.Worker.DatabaseStorage<Data> {
    let livingTransaction: IDBPTransaction<PluginDatabase, ['PluginStore']> | undefined = undefined
    let ended = false
    signal?.addEventListener('abort', () => {
        // give some extra time after the plugin shutdown to store data.
        setTimeout(() => (ended = true), 1500)
    })
    function key(data: IndexableTaggedUnion) {
        return IDBKeyRange.only([plugin_id, data.type, data.id])
    }
    function ensureAlive() {
        if (ended) throw new Error(`[@masknet/plugin-infra] Storage instance for ${plugin_id} has been expired.`)
    }
    return {
        async get(type, id) {
            const t = await c('r')
            const data = await t.store.get(key({ type, id }))
            if (!data) return undefined
            return data.value as any
        },
        async has(type, id) {
            const t = await c('r')
            const count = await t.store.count(key({ type, id }))
            return count > 0
        },
        async add(data) {
            const t = await c('rw')
            if (!pluginDataHasValidKeyPath(data)) throw new TypeError("Data doesn't have a valid key path")
            if (await t.store.get(key(data))) await t.store.put(toStore(plugin_id, data))
            else await t.store.add(toStore(plugin_id, data))
        },
        async remove(type, id) {
            ;(await c('rw')).store.delete(key({ type, id }))
        },
        async *iterate(type) {
            const db = await c('r')
            const cursor = await db
                .objectStore('PluginStore')
                .index('type')
                .openCursor(IDBKeyRange.only([plugin_id, type]))
            if (!cursor) return
            for await (const each of cursor) {
                const roCursor: Plugin.Worker.StorageReadonlyCursor<Data, typeof type> = {
                    value: each.value.value as any,
                }
                yield roCursor
            }
        },
        async *iterate_mutate(type) {
            const cursor = await (
                await c('rw')
            )
                .objectStore('PluginStore')
                .index('type')
                .openCursor(IDBKeyRange.only([plugin_id, type]))
            if (!cursor) return
            for await (const each of cursor) {
                const rwCursor: Plugin.Worker.StorageMutableCursor<Data, typeof type> = {
                    value: each.value.value as any,
                    delete: () => each.delete(),
                    update: async (data) => {
                        await each.update(toStore(plugin_id, data))
                    },
                }
                yield rwCursor
            }
        },
    }
    async function c(usage: 'r' | 'rw'): Promise<NonNullable<typeof livingTransaction>> {
        ensureAlive()
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
