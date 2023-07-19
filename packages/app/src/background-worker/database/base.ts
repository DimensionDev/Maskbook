import { openDB, type DBSchema } from 'idb/with-async-ittr'
import { createDBAccess } from './openDB.js'

type InStore = {
    plugin_id: string
    value: unknown
}

/** @internal */
export interface PluginDatabase extends DBSchema {
    PluginStore: {
        value: InStore
        indexes: {
            type: [string, string]
        }
        key: string
    }
}

const db = createDBAccess(() => {
    return openDB<PluginDatabase>('mask-plugin-data', 1, {
        async upgrade(db, oldVersion, newVersion, transaction) {
            // if (oldVersion < 1) current logic...
            // if (oldVersion < 2) future migration...
            const os = db.createObjectStore('PluginStore', { keyPath: ['plugin_id', 'value.type', 'value.id'] })
            // a compound index by "rec.plugin_id" + "rec.value.type"
            os.createIndex('type', ['plugin_id', 'value.type'])
        },
    })
})
// cause key path error in "add" will cause transaction fail, we need to check them first
/** @internal */
export function pluginDataHasValidKeyPath(value: unknown): value is InStore {
    try {
        if (typeof value !== 'object' || value === null) return false
        const id = Reflect.get(value, 'id')
        const type = Reflect.get(value, 'type')
        if (typeof id !== 'string' && typeof id !== 'number') return false
        if (typeof type !== 'string' && typeof type !== 'number') return false
        return true
    } catch {
        return false
    }
}
export const createPluginDBAccess = db
export function toStore(plugin_id: string, value: unknown): InStore {
    return { plugin_id, value }
}
