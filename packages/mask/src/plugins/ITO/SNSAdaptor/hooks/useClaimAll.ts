import { useRef, useEffect } from 'react'
import { useAsyncRetry } from 'react-use'
import type { SwappedTokenType } from '../../types.js'
import * as chain from '../utils/chain.js'
import type { ChainId } from '@masknet/web3-shared-evm'
import { useWeb3Connection } from '@masknet/web3-hooks-base'
import { NetworkPluginID } from '@masknet/shared-base'

export function useClaimAll(swapperAddress: string, chainId: ChainId) {
    const allPoolsRef = useRef<SwappedTokenType[]>([])

    useEffect(() => {
        allPoolsRef.current = []
    }, [chainId])

    const connection = useWeb3Connection(NetworkPluginID.PLUGIN_EVM, { chainId })
    const asyncResult = useAsyncRetry(async () => {
        if (allPoolsRef.current.length > 0 || !connection) return allPoolsRef.current
        const blockNumber = await connection.getBlockNumber()
        const results = await chain.getClaimAllPools(chainId, blockNumber, swapperAddress, connection)
        allPoolsRef.current = results
        return allPoolsRef.current
    }, [swapperAddress, chainId, connection])

    return {
        ...asyncResult,
        retry: () => {
            allPoolsRef.current = []
            asyncResult.retry()
        },
    }
}
