import { useState, useEffect } from 'react'
import { useChainId } from '.'
import type { ChainId } from '..'
import { useWeb3StateContext } from '../context'

/**
 * Get the current block number of current chain
 */
export function useBlockNumber(chainId?: ChainId) {
    const defaultChainId = useChainId()
    const { blockNumberOfChain } = useWeb3StateContext()
    return blockNumberOfChain[chainId ?? defaultChainId] ?? 0
}

/**
 * Get the current block number only once
 * @returns
 */
export function useBlockNumberOnce() {
    const blockNumber = useBlockNumber()
    const [blockNumberOnce, setBlockNumberOnce] = useState(0)
    useEffect(() => {
        if (blockNumberOnce === 0 && blockNumber > 0) setBlockNumberOnce(blockNumber)
    }, [blockNumber])
    return blockNumberOnce
}
