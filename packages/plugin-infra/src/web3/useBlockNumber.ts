import { useState, useEffect } from 'react'
import { useChainId } from '.'
import type { NetworkPluginID } from '..'
import { usePluginWeb3StateContext } from './Context'

/**
 * Get the current block number of current chain
 */
export function useBlockNumber(chainId?: number, pluginID?: NetworkPluginID) {
    const defaultChainId = useChainId(pluginID)
    const { blockNumberOfChain } = usePluginWeb3StateContext(pluginID)
    return blockNumberOfChain?.[chainId ?? defaultChainId] ?? 0
}

/**
 * Get the current block number only once
 * @returns
 */
export function useBlockNumberOnce(chainId?: number, pluginID?: NetworkPluginID) {
    const blockNumber = useBlockNumber(chainId, pluginID)
    const [blockNumberOnce, setBlockNumberOnce] = useState(0)
    useEffect(() => {
        if (blockNumberOnce === 0 && blockNumber > 0) setBlockNumberOnce(blockNumber)
    }, [blockNumber])
    return blockNumberOnce
}
