import { useAsyncRetry } from 'react-use'
import { PluginITO_RPC } from '../../messages'
import type { PoolFromNetwork } from '../../types'
import { useBlockNumber } from '@masknet/web3-shared'
import { useRef } from 'react'

export function useAllPoolsAsSeller(address: string, page: number) {
    const allPoolsRef = useRef<PoolFromNetwork[]>([])
    const blockNumber = useBlockNumber()

    return useAsyncRetry(async () => {
        const _pools = await PluginITO_RPC.getAllPoolsAsSeller(address, page, blockNumber)
        const pools = _pools.filter((a) => !allPoolsRef.current.map((b) => b.pool.pid).includes(a.pool.pid))
        allPoolsRef.current = allPoolsRef.current.concat(pools)
        return { pools: allPoolsRef.current, loadMore: pools.length > 0 }
    }, [address, page, blockNumber])
}
