import { useRef, useEffect } from 'react'
import { useAsyncRetry } from 'react-use'
import { useChainContext } from '@masknet/web3-hooks-base'
import type { NetworkPluginID } from '@masknet/shared-base'
import { type ChainId, getITOConstants } from '@masknet/web3-shared-evm'
import { Web3 } from '@masknet/web3-providers'
import type { PoolFromNetwork } from '../../types.js'
import * as chain from '../utils/chain.js'
import { PluginITO_RPC } from '../../messages.js'

export function useAllPoolsAsSeller(address: string) {
    const allPoolsRef = useRef<PoolFromNetwork[]>([])
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()

    useEffect(() => {
        allPoolsRef.current = []
    }, [chainId])

    return useAsyncRetry(async () => {
        const blockNumber = await Web3.getBlockNumber({
            chainId,
        })
        const _pools = await getAllPoolsAsSeller(address, blockNumber, chainId)
        const pools = _pools.filter((a) => !allPoolsRef.current.map((b) => b.pool.pid).includes(a.pool.pid))
        allPoolsRef.current = allPoolsRef.current.concat(pools)
        return { pools: allPoolsRef.current, loadMore: pools.length > 0 }
    }, [address, chainId])
}

async function getAllPoolsAsSeller(address: string, endBlock: number, chainId: ChainId) {
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
