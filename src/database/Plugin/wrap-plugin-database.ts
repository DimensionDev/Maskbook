import type { IDBPTransaction } from 'idb/build/cjs'
import { calculateKey, createPluginDBAccess, PluginDatabase, toStore } from '.'

export function createPluginDatabase<Data extends { type: string | number; id: string | number }>(plugin_id: string) {
    type Type = Data['type']
    type Of<K extends Type> = Data & {
        type: K
    }
    type ID<K extends Type> = Of<K>['id']
    let livingTx: IDBPTransaction<PluginDatabase, ['PluginStore']> | undefined = undefined
    return {
        // Plz keep the API minimal
        async get<T extends Type>(type: T, id: ID<T>): Promise<Of<T> | undefined> {
            const t = await c('r')
            const data = await t.store.get(calculateKey(plugin_id, { type, id }))
            if (!data) return undefined
            return data.value as any
        },
        async set<T extends Type>(type: T, data: Of<T>): Promise<void> {
            const t = await c('rw')
            const key = calculateKey(plugin_id, data)
            if (await t.store.get(key)) await t.store.add(toStore(plugin_id, data), key)
            else await t.store.put(toStore(plugin_id, data), key)
        },
        async remove<T extends Type>(type: T, id: ID<T>): Promise<void> {
            const key = calculateKey(plugin_id, { type, id })
            await (await c('rw')).store.delete(key)
        },
        async *iterate<T extends Type>(type: T) {
            for await (const each of (await c('r')).objectStore('PluginStore')) {
                if (each.value.plugin_id !== plugin_id) continue
                if (each.value.type !== type) continue
                yield each.value.value as Of<T>
            }
        },
        async *iterate_mutate<T extends Type>(type: T) {
            for await (const each of (await c('r')).objectStore('PluginStore')) {
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
    async function c(usage: 'r' | 'rw'): Promise<NonNullable<typeof livingTx>> {
        if (usage === 'rw' && livingTx?.mode === 'readonly') {
            livingTx = undefined
        }
        if (livingTx === undefined) {
            const db = await createPluginDBAccess()
            const tx = db.transaction('PluginStore', usage === 'r' ? 'readonly' : 'readwrite')
            livingTx = tx
            tx.addEventListener('complete', () => (livingTx = undefined))
            tx.addEventListener('abort', () => (livingTx = undefined))
            tx.addEventListener('error', () => (livingTx = undefined))
            return tx
        }
        return livingTx
    }
}
