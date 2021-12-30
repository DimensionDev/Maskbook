import { openDB, DBSchema } from 'idb/with-async-ittr'
import { createDBAccess } from '../../../background/database/utils/openDB'

type InStore = {
    plugin_id: string
    value: unknown
}

//#region Schema

export interface PluginDatabase extends DBSchema {
    PluginStore: {
        value: InStore
        indexes: {
            type: [string, string]
        }
        key: string
    }
}
//#endregion

const db = createDBAccess(() => {
    return openDB<PluginDatabase>('maskbook-plugin-data', 2, {
        async upgrade(db, oldVersion, newVersion, transaction) {
            if (oldVersion < 1) db.createObjectStore('PluginStore')
            if (oldVersion < 2) {
                const data = await transaction.objectStore('PluginStore').getAll()
                db.deleteObjectStore('PluginStore')
                const os = db.createObjectStore('PluginStore', { keyPath: ['plugin_id', 'value.type', 'value.id'] })

                // a compound index by "rec.plugin_id" + "rec.value.type"
                os.createIndex('type', ['plugin_id', 'value.type'])
                for (const each of data) {
                    if (!each.plugin_id) continue
                    if (!pluginDataHasValidKeyPath(each.value)) continue
                    Reflect.deleteProperty(each, 'type')
                    Reflect.deleteProperty(each, 'record_id')
                    await os.add(each)
                }
            }
        },
    })
})
// cause key path error in "add" will cause transaction fail, we need to check them first
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
