/// <reference path="../global.d.ts" />
import { openDB, DBSchema } from 'idb/with-async-ittr-cjs'
import { createDBAccess } from '../helpers/openDB'

type InStore = {
    plugin_id: string
    type: string | number
    record_id: string | number
    value: unknown
}

//#region Schema

export interface PluginDatabase extends DBSchema {
    PluginStore: {
        value: InStore
        indexes: {
            plugin_id: string
            type: string | number
        }
        key: string
    }
}
//#endregion

const db = createDBAccess(() => {
    return openDB<PluginDatabase>('maskbook-plugin-data', 1, {
        upgrade(db, oldVersion, newVersion, transaction) {
            // Out line keys
            const os = db.createObjectStore('PluginStore')
        },
    })
})
export const createPluginDBAccess = db
export function calculateKey(pluginID: string, data: unknown) {
    const type = getType(data)
    const id = getID(data)
    return `${pluginID}/${type}/${id}`
}
export function toStore(plugin_id: string, data: unknown): InStore {
    return {
        plugin_id,
        record_id: getID(data),
        type: getType(data),
        value: data,
    }
}
function getID(data: unknown) {
    if (typeof data !== 'object' || data === null) throw new Error('You must store a tagged union object')
    const id = Reflect.get(data, 'id')
    if (typeof id !== 'number' && typeof id !== 'string') throw new Error('id must be a string or a number')
    return id
}
function getType(data: unknown) {
    if (typeof data !== 'object' || data === null) throw new Error('You must store a tagged union object')
    const type = Reflect.get(data, 'type')
    if (typeof type !== 'number' && typeof type !== 'string') throw new Error('type must be a string or a number')
    if (String(type).includes('/')) throw new Error('type cannot contain "/"')
    return type
}
