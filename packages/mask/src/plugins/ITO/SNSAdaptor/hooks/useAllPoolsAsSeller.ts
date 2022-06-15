import { useChainId, useWeb3Connection, Web3Helper } from '@masknet/plugin-infra/web3'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { ChainId, getITOConstants } from '@masknet/web3-shared-evm'
import { useRef, useEffect } from 'react'
import { useAsyncRetry } from 'react-use'
import type { PoolFromNetwork } from '../../types'
import * as chain from '../utils/chain'
import { PluginITO_RPC } from '../../messages'
import { EMPTY_LIST } from '@masknet/shared-base'

export function useAllPoolsAsSeller(address: string) {
    const allPoolsRef = useRef<PoolFromNetwork[]>([])
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const connection = useWeb3Connection(NetworkPluginID.PLUGIN_EVM, { chainId })

    useEffect(() => {
        allPoolsRef.current = []
    }, [chainId])

    return useAsyncRetry(async () => {
        if (!connection)
            return {
                pools: EMPTY_LIST,
                loadMore: false,
            }
        const blockNumber = await connection.getBlockNumber()
        const _pools = await getAllPoolsAsSeller(address, blockNumber, chainId, connection)
        const pools = _pools.filter((a) => !allPoolsRef.current.map((b) => b.pool.pid).includes(a.pool.pid))
        allPoolsRef.current = allPoolsRef.current.concat(pools)
        return { pools: allPoolsRef.current, loadMore: pools.length > 0 }
    }, [address, chainId, connection])
}

async function getAllPoolsAsSeller(
    address: string,
    endBlock: number,
    chainId: ChainId,
    connection: Web3Helper.Web3Connection<NetworkPluginID.PLUGIN_EVM>,
) {
    if (!connection) return EMPTY_LIST

    const { ITO2_CONTRACT_CREATION_BLOCK_HEIGHT } = getITOConstants(chainId)

    // #region Get data from chain.
    const poolsFromChain = await chain.getAllPoolsAsSeller(
        chainId,
        ITO2_CONTRACT_CREATION_BLOCK_HEIGHT,
        endBlock,
        address,
        connection,
    )
    // #endregion

    // #region Inject password from database
    const poolsFromDB = await PluginITO_RPC.getAllPoolsAsSellerFromDatabase(poolsFromChain)
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
