import { useAsyncTimes } from '../../utils/hooks/useAsyncTimes'
import { useCallback } from 'react'
import Services from '../../extension/service'
import { useIsWindowVisible } from '../../utils/hooks/useIsWindowVisible'

/**
 * Polling block number
 */
export function useBlockNumber() {
    const isWindowVisible = useIsWindowVisible()
    const callback = useCallback(async () => {
        if (!isWindowVisible) return
        return Services.Ethereum.getBlockNumber()
    }, [isWindowVisible])

    // TODO:
    // add listener on web3 provider
    return useAsyncTimes(callback, {
        times: Number.MAX_SAFE_INTEGER,
        delay: 30 /* seconds */ * 1000 /* milliseconds */,
    })
}
