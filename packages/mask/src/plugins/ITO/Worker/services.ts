import type { JSON_PayloadInMask, PoolRecord } from '../types'
import * as subgraph from './apis/subgraph'
import * as chain from './apis/chain'
import * as database from './database'
import { ChainId, chainResolver, getITOConstants } from '@masknet/web3-shared-evm'

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

export async function getAllPoolsAsSeller(address: string, endBlock: number, chainId: ChainId) {
    const { ITO2_CONTRACT_CREATION_BLOCK_HEIGHT } = getITOConstants(chainId)

    // #region Get data from chain.
    const poolsFromChain = await chain.getAllPoolsAsSeller(
        chainId,
        ITO2_CONTRACT_CREATION_BLOCK_HEIGHT,
        endBlock,
        address,
    )
    // #endregion

    // #region Inject password from database
    const poolsFromDB = await database.getAllPoolsAsSeller(poolsFromChain.map((x) => x.pool.pid))
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
    // #endregion
}

export async function getAllPoolsAsBuyer(address: string, chainId: ChainId) {
    if (!chainResolver.isValid(chainId)) return []
    const pools = await subgraph.getAllPoolsAsBuyer(address, chainId)
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

export async function getClaimAllPools(chainId: ChainId, endBlock: number, swapperAddress: string) {
    return chain.getClaimAllPools(chainId, endBlock, swapperAddress)
}
