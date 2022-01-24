import { useAsyncRetry } from 'react-use'
import { PluginITO_RPC } from '../../messages'
import { useBlockNumberOfChain } from './useBlockNumberOfChain'
import type { SwappedTokenType } from '../../types'
import type { ChainId } from '@masknet/web3-shared-evm'
import { useRef, useEffect } from 'react'

export function useClaimAll(swapperAddress: string, chainId: ChainId) {
    const allPoolsRef = useRef<SwappedTokenType[]>([])

    useEffect(() => {
        allPoolsRef.current = []
    }, [chainId])

    const { value: blockNumber = 0 } = useBlockNumberOfChain(chainId)
    return useAsyncRetry(async () => {
        if (allPoolsRef.current.length > 0) return allPoolsRef.current
        const results = await PluginITO_RPC.getClaimAllPools(chainId, blockNumber, swapperAddress)
        allPoolsRef.current = results
        return allPoolsRef.current
    }, [swapperAddress, blockNumber, chainId])
}
