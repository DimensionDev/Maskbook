import { useRef, useEffect } from 'react'
import { useAsyncRetry } from 'react-use'
import { PluginITO_RPC } from '../../messages'
import type { PoolFromNetwork } from '../../types'
import { useBlockNumber, useChainId } from '@masknet/web3-shared-evm'

export function useAllPoolsAsSeller(address: string) {
    const allPoolsRef = useRef<PoolFromNetwork[]>([])
    const chainId = useChainId()
    const { value: blockNumber = 0 } = useBlockNumber()

    useEffect(() => {
        allPoolsRef.current = []
    }, [chainId])

    return useAsyncRetry(async () => {
        const _pools = await PluginITO_RPC.getAllPoolsAsSeller(address, blockNumber, chainId)
        const pools = _pools.filter((a) => !allPoolsRef.current.map((b) => b.pool.pid).includes(a.pool.pid))
        allPoolsRef.current = allPoolsRef.current.concat(pools)
        return { pools: allPoolsRef.current, loadMore: pools.length > 0 }
    }, [address, blockNumber, chainId])
}
