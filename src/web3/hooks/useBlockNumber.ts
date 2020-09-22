import { useAsyncTimes } from '../../utils/hooks/useAsyncTimes'
import { useCallback, useState } from 'react'
import Services from '../../extension/service'
import { useIsWindowVisible } from '../../utils/hooks/useIsWindowVisible'

/**
 * Polling block number
 */
export function useBlockNumber() {
    const [blockNumber, setBlockNumber] = useState(0)
    const isWindowVisible = useIsWindowVisible()
    const callback = useCallback(async () => {
        console.log('DEBUG: isWindowVisible')
        console.log(isWindowVisible)
        if (!isWindowVisible) return
        setBlockNumber(await Services.Ethereum.getBlockNumber())
    }, [isWindowVisible])

    // TODO:
    // add listener on web3 provider
    useAsyncTimes(callback, {
        times: Number.MAX_SAFE_INTEGER,
        delay: 15 /* seconds */ * 1000 /* milliseconds */,
    })
    return blockNumber
}
