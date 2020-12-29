import type { JSON_PayloadInMask, PoolRecord } from './types'
import { PluginITO_Messages } from './messages'

import * as subgraph from './apis'
import * as database from './database'

export async function getPool(pid: string) {
    const poolFromChain = await subgraph.getPool(pid)
    const poolFromDB = await database.getPoolFromDB(pid)
    if (poolFromDB?.payload.password) poolFromChain.password = poolFromDB.payload.password
    return poolFromChain
}

export async function getAllPoolsAsSeller(address: string) {
    const poolsFromChain = await subgraph.getAllPoolsAsSeller(address)
    const poolsFromDB = await database.getPoolsFromDB(poolsFromChain.map((x) => x.pool.pid))

    return poolsFromChain.map((x) => {
        const pool = poolsFromDB.find((y) => y.payload.pid === x.pool.pid)
        if (!pool) return x
        return {
            ...x,
            pool: {
                ...x.pool,
                password: pool.payload.password,
            },
        }
    })
}

export function getAllPoolsAsBuyer(address: string) {
    return subgraph.getAllPoolsAsBuyer(address)
}

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
