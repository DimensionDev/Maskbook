import type { JSON_PayloadInMask, PoolRecord } from './types'
import { PluginITO_Messages } from './messages'

import * as subgraph from './apis'
import * as database from './database'
import { getChainId } from '../../extension/background-script/EthereumService'

export async function getTradeInfo(pid: string, trader: string) {
    const tradeInfo = await subgraph.getTradeInfo(pid, trader)
    const poolFromDB = await database.getPoolFromDB(pid)
    if (tradeInfo && poolFromDB?.payload.password) tradeInfo.pool.password = poolFromDB.payload.password
    if (tradeInfo && poolFromDB?.payload.is_mask) tradeInfo.pool.is_mask = poolFromDB.payload.is_mask
    if (tradeInfo && poolFromDB?.payload.test_nums) tradeInfo.pool.test_nums = poolFromDB.payload.test_nums
    return tradeInfo
}

export async function getPool(pid: string) {
    const poolFromChain = await subgraph.getPool(pid)
    const poolFromDB = await database.getPoolFromDB(pid)
    if (poolFromDB?.payload.password) poolFromChain.password = poolFromDB.payload.password
    if (poolFromDB?.payload.is_mask) poolFromChain.is_mask = poolFromDB.payload.is_mask
    if (poolFromDB?.payload.test_nums) poolFromChain.test_nums = poolFromDB.payload.test_nums
    return poolFromChain
}

export async function getAllPoolsAsSeller(address: string) {
    const chainId = await getChainId()
    const poolsFromChain = await subgraph.getAllPoolsAsSeller(address)
    const poolsFromDB = await database.getPoolsFromDB(poolsFromChain.map((x) => x.pool.pid))
    return poolsFromChain
        .map((x) => {
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
        .filter((x) => x.pool.chain_id === chainId)
}

export async function getAllPoolsAsBuyer(address: string) {
    const chainId = await getChainId()
    const pools = await subgraph.getAllPoolsAsBuyer(address)
    return pools.filter((x) => x.pool.chain_id === chainId)
}

export async function discoverPool(from: string, payload: JSON_PayloadInMask) {
    if (!payload.pid) return
    if (!payload.password) return
    const record_ = await database.getPoolFromDB(payload.pid)
    const record: PoolRecord = {
        id: payload.pid,
        from: record_?.from || from,
        payload: {
            ...record_?.payload,
            ...payload,
            // reverse password if given payload hasn't got a password
            password: payload.password || (record_?.payload.password ?? ''),
            is_mask: payload.is_mask || (record_?.payload.is_mask ?? false),
            test_nums: payload.test_nums || (record_?.payload.test_nums ?? undefined),
        },
    }
    await database.addPoolIntoDB(record)
    PluginITO_Messages.events.poolUpdated.sendToAll(undefined)
}
