import { useRef, useEffect } from 'react'
import { useAsyncRetry } from 'react-use'
import type { SwappedTokenType } from '../../types'
import * as chain from '../utils/chain'
import type { ChainId } from '@masknet/web3-shared-evm'
import { useWeb3Connection } from '@masknet/plugin-infra/web3'
import { NetworkPluginID } from '@masknet/web3-shared-base'

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
    }, [swapperAddress, chainId])

    return {
        ...asyncResult,
        retry: () => {
            allPoolsRef.current = []
            asyncResult.retry()
        },
    }
}
