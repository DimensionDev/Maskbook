import { useState, useEffect } from 'react'
import { usePluginWeb3StateContext } from './Context'

/**
 * Get the current block number of current chain
 */
export function useBlockNumber(pluginID?: string) {
    return usePluginWeb3StateContext(pluginID).blockNumber
}

/**
 * Get the current block number only once
 * @returns
 */
export function useBlockNumberOnce(pluginID?: string) {
    const blockNumber = useBlockNumber(pluginID)
    const [blockNumberOnce, setBlockNumberOnce] = useState(0)
    useEffect(() => {
        if (blockNumberOnce === 0 && blockNumber > 0) setBlockNumberOnce(blockNumber)
    }, [blockNumber])
    return blockNumberOnce
}
