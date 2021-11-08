import { useState, useEffect } from 'react'
import { usePluginWeb3StateContext } from '../context'

/**
 * Get the current block number of current chain
 */
export function useBlockNumber() {
    return usePluginWeb3StateContext().blockNumber
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
