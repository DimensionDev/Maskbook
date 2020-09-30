import { useAsyncTimes } from '../../utils/hooks/useAsyncTimes'
import { useCallback, useEffect, useState } from 'react'
import Services from '../../extension/service'
import { useIsWindowVisible } from '../../utils/hooks/useIsWindowVisible'
import { ValueRef } from '@holoflows/kit/es'
import { useValueRef } from '../../utils/hooks/useValueRef'

//#region tracking block number
const blockNumberRef = new ValueRef<number>(0)
async function revalidate() {
    blockNumberRef.value = await Services.Ethereum.getBlockNumber()
}
revalidate()
//#endregion

/**
 * Polling block number
 */
export function useBlockNumber() {
    const isWindowVisible = useIsWindowVisible()
    const callback = useCallback(async () => {
        if (!isWindowVisible) return
        revalidate()
    }, [isWindowVisible])

    // TODO:
    // add listener on web3 provider
    useAsyncTimes(callback, {
        times: Number.MAX_SAFE_INTEGER,
        delay: 10 /* seconds */ * 1000 /* milliseconds */,
    })
    return useValueRef(blockNumberRef)
}

/**
 * Polling block number once
 */
export function useBlockNumberOnce() {
    const blockNumber_ = useValueRef(blockNumberRef)
    const [blockNumber, setBlockNumber] = useState(0)

    useEffect(() => {
        if (blockNumber === 0) setBlockNumber(blockNumber_)
    }, [blockNumber_])
    return blockNumber
}
