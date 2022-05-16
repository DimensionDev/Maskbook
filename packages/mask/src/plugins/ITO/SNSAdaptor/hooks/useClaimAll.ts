import { useRef, useEffect } from 'react'
import { useAsyncRetry } from 'react-use'
import { PluginITO_RPC } from '../../messages'
import type { SwappedTokenType } from '../../types'
import type { ChainId } from '@masknet/web3-shared-evm'
import { useBlockNumber } from '@masknet/plugin-infra/src/web3'
import { NetworkPluginID } from '@masknet/web3-shared-base'

export function useClaimAll(swapperAddress: string, chainId: ChainId) {
    const allPoolsRef = useRef<SwappedTokenType[]>([])

    useEffect(() => {
        allPoolsRef.current = []
    }, [chainId])

    const { value: blockNumber = 0 } = useBlockNumber(NetworkPluginID.PLUGIN_EVM, { chainId })
    const asyncResult = useAsyncRetry(async () => {
        if (allPoolsRef.current.length > 0) return allPoolsRef.current
        const results = await PluginITO_RPC.getClaimAllPools(chainId, blockNumber, swapperAddress)
        allPoolsRef.current = results
        return allPoolsRef.current
    }, [swapperAddress, blockNumber, chainId])

    return {
        ...asyncResult,
        retry: () => {
            allPoolsRef.current = []
            asyncResult.retry()
        },
    }
}
