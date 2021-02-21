import type { JSON_PayloadInMask, PoolRecord } from './types'
import { PluginITO_Messages } from './messages'

import * as subgraph from './apis'
import * as database from './database'
import { getChainId } from '../../extension/background-script/EthereumService'

export async function getTradeInfo(pid: string, trader: string) {
    const tradeInfo = await subgraph.getTradeInfo(pid, trader)
    const poolFromDB = await database.getPoolFromDB(pid)
    if (tradeInfo && poolFromDB?.payload.password) tradeInfo.pool.password = poolFromDB.payload.password
    if (tradeInfo && poolFromDB?.payload.isMask) tradeInfo.pool.isMask = poolFromDB.payload.isMask
    if (tradeInfo && poolFromDB?.payload.testNums) tradeInfo.pool.testNums = poolFromDB.payload.testNums
    return tradeInfo
}

export async function getPool(pid: string) {
    const poolFromChain = await subgraph.getPool(pid)
    const poolFromDB = await database.getPoolFromDB(pid)
    console.log('poolFromDB', poolFromDB)
    if (poolFromDB?.payload.password) poolFromChain.password = poolFromDB.payload.password
    if (poolFromDB?.payload.isMask) poolFromChain.isMask = poolFromDB.payload.isMask
    if (poolFromDB?.payload.testNums) poolFromChain.testNums = poolFromDB.payload.testNums
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
            isMask: payload.isMask || (record_?.payload.isMask ?? false),
            testNums: payload.testNums || (record_?.payload.testNums ?? undefined),
        },
    }
    await database.addPoolIntoDB(record)
    PluginITO_Messages.events.poolUpdated.sendToAll(undefined)
}
