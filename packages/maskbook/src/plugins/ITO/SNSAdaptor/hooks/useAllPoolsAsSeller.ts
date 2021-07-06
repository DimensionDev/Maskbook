import { useAsyncRetry } from 'react-use'
import { PluginITO_RPC } from '../../messages'
import type { PoolSubgraph } from '../../types'
import { useRef } from 'react'

export function useAllPoolsAsSeller(address: string, page: number) {
    const allPoolsRef = useRef<PoolSubgraph[]>([])
    return useAsyncRetry(async () => {
        const pools = await PluginITO_RPC.getAllPoolsAsSeller(address, page)
        allPoolsRef.current = allPoolsRef.current.concat(pools)
        return { pools: allPoolsRef.current, loadMore: pools.length > 0 }
    }, [address, page])
}
