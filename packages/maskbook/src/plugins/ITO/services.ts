import type { JSON_PayloadInMask, PoolRecord } from './types'
import * as database from './database'
import { PluginITO_Messages } from './messages'

export * from './apis'
export * from './database'

export async function discoverPool(from: string, payload: JSON_PayloadInMask) {
    if (!payload.pid) return
    if (!payload.password) return
    const record_ = await database.getPoolFromDB(payload.pid)
    const record: PoolRecord = {
        id: payload.pid,
        from: record_?.from || from,
        payload: record_?.payload ?? payload,
    }
    database.addPoolIntoDB(record)
    PluginITO_Messages.events.poolUpdated.sendToAll(undefined)
}
