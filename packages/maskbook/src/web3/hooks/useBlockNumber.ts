import { useEffect, useState } from 'react'
import { useValueRef } from '../../utils/hooks/useValueRef'
import { ChainId } from '../types'
import { currentBlockNumnberStateSettings } from '../../settings/settings'
import type { ChainBlockNumber } from '../../settings/types'
/**
 * Get the current block number
 */
export function useBlockNumber(chainId: ChainId) {
    return useBlockNumberState(chainId).blockNumber
}

/**
 * Get the current block number for once
 */
export function useBlockNumberOnce(chainId: ChainId) {
    const blockNumberState = useBlockNumberState(chainId)
    const [chainState, setChainState] = useState({
        chainId: ChainId.Mainnet,
        blockNumber: 0,
    })
    useEffect(() => {
        if (chainState.blockNumber === 0 || chainState.chainId !== blockNumberState.chainId)
            setChainState(blockNumberState)
    }, [blockNumberState])
    return chainState.blockNumber
}

/**
 * Get the newest chain state
 */
const DEFAULT_CHAIN_STATE = {
    chainId: ChainId.Mainnet,
    blockNumber: 0,
}

function useBlockNumberState(chainId: ChainId) {
    const chainState = useValueRef(currentBlockNumnberStateSettings)
    try {
        const parsedChainState = JSON.parse(chainState) as ChainBlockNumber[]
        return parsedChainState.find((x) => x.chainId === chainId) ?? DEFAULT_CHAIN_STATE
    } catch (e) {
        return DEFAULT_CHAIN_STATE
    }
}
