import { useEffect, useState } from 'react'
import { useValueRef } from '../../utils/hooks/useValueRef'
import {
    currentBlockNumberSettings,
} from '../../plugins/Wallet/settings'

/**
 * Get the current block number
 */
export function useBlockNumber() {
    const blockNumber = useValueRef(currentBlockNumberSettings)
    return blockNumber
}

/**
 * Get the current block number for once
 */
export function useBlockNumberOnce() {
    const blockNumber = useBlockNumber()
    const [blockNumberOnce, setBlockNumberOnce] = useState(0)
    useEffect(() => {
        if (blockNumberOnce === 0 && blockNumber > 0) setBlockNumberOnce(blockNumber)
    }, [blockNumber])
    return blockNumberOnce
}
