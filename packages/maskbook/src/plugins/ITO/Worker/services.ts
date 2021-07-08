import type { JSON_PayloadInMask, PoolRecord } from '../types'
import { PluginITO_Messages } from '../messages'
import * as subgraph from './apis'
import * as database from './database'
import { getChainDetailed } from '@masknet/web3-shared'
import { currentChainIdSettings } from '../../Wallet/settings'

export async function getTradeInfo(pid: string, trader: string) {
    const tradeInfo = await subgraph.getTradeInfo(pid, trader)
    return tradeInfo
}

export async function getPool(pid: string) {
    const poolFromChain = await subgraph.getPool(pid)
    const poolFromDB = await database.getPoolFromDB(pid)
    if (poolFromDB?.payload.password) poolFromChain.password = poolFromDB.payload.password
    return poolFromChain
}

export async function getAllPoolsAsSeller(address: string, page: number) {
    const chainId = currentChainIdSettings.value
    const poolsFromChain = await subgraph.getAllPoolsAsSeller(address, page)
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
    const chainId = currentChainIdSettings.value
    const chainDetailed = getChainDetailed(chainId)
    if (!chainDetailed) return []
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
        },
    }
    await database.addPoolIntoDB(record)
    PluginITO_Messages.events.poolUpdated.sendToAll(undefined)
}
