import { useEffect, useState } from 'react'
import { useValueRef } from '../../utils/hooks/useValueRef'
import { ChainId } from '../types'
import { ChainState, currentChainStateSettings } from '../../settings/settings'

/**
 * Get the chain id which is using by the current wallet
 */
export function useChainId() {
    return useChainState().chainId
}

/**
 * Get the current block number
 */
export function useBlockNumber() {
    return useChainState().blockNumber
}

/**
 * Get the current block number for once
 */
export function useBlockNumberOnce() {
    const chainState_ = useChainState()
    const [chainState, setChainState] = useState({
        chainId: ChainId.Mainnet,
        blockNumber: 0,
    })
    useEffect(() => {
        if (chainState.blockNumber === 0 || chainState.chainId !== chainState_.chainId) setChainState(chainState_)
    }, [chainState_])
    return chainState.blockNumber
}

/**
 * Get the newest block state
 */
export function useChainState() {
    const state = useValueRef(currentChainStateSettings)
    try {
        return JSON.parse(state) as ChainState
    } catch (e) {
        return {
            chainId: ChainId.Mainnet,
            blockNumber: 0,
        }
    }
}
