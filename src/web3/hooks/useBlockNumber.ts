import { useAsyncTimes } from '../../utils/hooks/useAsyncTimes'
import { useCallback } from 'react'
import Services from '../../extension/service'

/**
 * Polling block number
 */
export function useBlockNumber() {
    const callback = useCallback(() => Services.Ethereum.getBlockNumber(), [])
    return useAsyncTimes(callback, {
        times: Number.MAX_SAFE_INTEGER,
        delay: 30 /* seconds */ * 1000 /* milliseconds */,
    })
}
