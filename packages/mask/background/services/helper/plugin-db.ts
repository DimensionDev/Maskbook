import { PluginId, Plugin, IndexableTaggedUnion } from '@masknet/plugin-infra'
import { createPluginDatabase } from '../../database/plugin-db'

const pluginDatabaseMap = new Map<string, Plugin.Worker.DatabaseStorage>()

pluginDatabaseMap.set(PluginId.RedPacket, createPluginDatabase(PluginId.RedPacket))
pluginDatabaseMap.set(PluginId.ITO, createPluginDatabase(PluginId.ITO))

export async function mobile_getPluginDataById(
    pluginId: string,
    type: IndexableTaggedUnion['type'],
    id: IndexableTaggedUnion['id'],
) {
    if (process.env.architecture !== 'app') throw new Error('Error arch')
    const db = pluginDatabaseMap.get(pluginId)
    if (!db) return
    return db.get(type, id)
}

export async function mobile_setPluginData(pluginId: string, type: IndexableTaggedUnion['type'], record: any) {
    if (process.env.architecture !== 'app') throw new Error('Error arch')
    const db = pluginDatabaseMap.get(pluginId)
    if (!db || (await db.has(type, record.id!))) return
    return db.add(record)
}
