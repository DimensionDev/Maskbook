import { useRef, useEffect } from 'react'
import { useAsyncRetry } from 'react-use'
import { EMPTY_LIST } from '@masknet/shared-base'
import type { ChainId } from '@masknet/web3-shared-evm'
import { Web3 } from '@masknet/web3-providers'
import type { SwappedTokenType } from '../../types.js'
import * as chain from '../utils/chain.js'

export function useClaimAll(swapperAddress: string, chainId: ChainId) {
    const allPoolsRef = useRef<SwappedTokenType[]>(EMPTY_LIST)

    useEffect(() => {
        allPoolsRef.current = EMPTY_LIST
    }, [chainId])

    const asyncResult = useAsyncRetry(async () => {
        if (allPoolsRef.current.length > 0) return allPoolsRef.current
        const blockNumber = await Web3.getBlockNumber({ chainId })
        const results = await chain.getClaimAllPools(chainId, blockNumber, swapperAddress)
        allPoolsRef.current = results
        return allPoolsRef.current
    }, [swapperAddress, chainId])

    return {
        ...asyncResult,
        retry: () => {
            allPoolsRef.current = EMPTY_LIST
            asyncResult.retry()
        },
    }
}
