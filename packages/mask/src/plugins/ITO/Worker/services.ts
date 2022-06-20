import type { JSON_PayloadInMask, PoolRecord, PoolFromNetwork } from '../types'
import * as subgraph from './apis/subgraph'
import * as database from './database'
import { ChainId, chainResolver } from '@masknet/web3-shared-evm'

export async function getTradeInfo(pid: string, trader: string, chainId: ChainId) {
    const tradeInfo = await subgraph.getTradeInfo(chainId, pid, trader)
    return tradeInfo
}

export async function getPool(pid: string, chainId: ChainId) {
    const poolFromChain = await subgraph.getPool(chainId, pid)
    const poolFromDB = await database.getPoolFromDB(pid)
    if (poolFromDB?.payload.password) poolFromChain.password = poolFromDB.payload.password
    return poolFromChain
}

export async function getAllPoolsAsSellerFromDatabase(poolsFromChain: PoolFromNetwork[]) {
    return database.getAllPoolsAsSeller(poolsFromChain.map((x) => x.pool.pid))
}

export async function getAllPoolsAsBuyer(address: string, chainId: ChainId) {
    if (!chainResolver.isValid(chainId)) return []
    const pools = await subgraph.getAllPoolsAsBuyer(chainId, address)
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
        },
    }
    await database.addPoolIntoDB(record)
}
