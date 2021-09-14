import type { JSON_PayloadInMask, PoolRecord, PoolFromSubgraph } from '../types'
import * as subgraph from './apis/subgraph'
import * as chain from './apis/chain'
import * as database from './database'
import { getChainDetailed, ChainId, getITOConstants } from '@masknet/web3-shared'
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

export async function getAllPoolsAsSeller(address: string, page: number, endBlock: number) {
    const chainId = currentChainIdSettings.value
    const { ITO2_CONTRACT_CREATION_BLOCK_HEIGHT } = getITOConstants(chainId)
    const poolsFromSubgraph = await subgraph.getAllPoolsAsSeller(address, page)
    const latestPoolFromSubgraph = poolsFromSubgraph[0]
    const latestBlockNumberFromSubgraph = getLatestBlockNumberFromSubgraph(
        latestPoolFromSubgraph,
        page,
        ITO2_CONTRACT_CREATION_BLOCK_HEIGHT,
    )

    const poolsFromChain = await chain.getAllPoolsAsSeller(chainId, latestBlockNumberFromSubgraph, endBlock, address)
    console.log({ poolsFromChain, latestBlockNumberFromSubgraph })
    const poolsFromDB = await database.getAllPoolsAsSeller(poolsFromSubgraph.map((x) => x.pool.pid))
    return poolsFromSubgraph
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

function getLatestBlockNumberFromSubgraph(
    poolsFromSubgraph: PoolFromSubgraph | undefined,
    page: number,
    creationBlockNumber: number | undefined,
) {
    return page === 0
        ? poolsFromSubgraph?.pool
            ? poolsFromSubgraph?.pool.block_number
            : creationBlockNumber
        : undefined
}

export async function getAllPoolsAsBuyer(address: string, chainId: ChainId) {
    const chainDetailed = getChainDetailed(chainId)
    if (!chainDetailed) return []
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
