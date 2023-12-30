import { type DependencyList, useState } from 'react'
import { useAsyncRetry, useTimeoutFn } from 'react-use'
import type { AsyncStateRetry } from 'react-use/lib/useAsyncRetry.js'
import type { NetworkPluginID } from '@masknet/shared-base'
import { useChainContext } from './useContext.js'
import { useWeb3Utils } from './useWeb3Utils.js'

const DEFAULT_SINGLE_BLOCK_DELAY = 10 * 1000 // 10 seconds
const DEFAULT_DOUBLE_BLOCK_DELAY = DEFAULT_SINGLE_BLOCK_DELAY * 2

function useBeat(delay = 1000) {
    const [beat, setBeat] = useState(0)
    const [, , reset] = useTimeoutFn(() => {
        setBeat((x) => (x + 1) % Number.MAX_SAFE_INTEGER)
        reset()
    }, delay)
    return beat
}

/**
 * @deprecated Use react-query with refetchInterval
 */
function useBeatRetry<T>(fn: () => Promise<T>, delay = 1000, deps: DependencyList = []): AsyncStateRetry<T> {
    const beat = useBeat(delay)
    return useAsyncRetry(fn, deps.concat(beat))
}

export function useCustomBlockBeatRetry<T extends NetworkPluginID, R>(
    pluginID: T,
    fn: () => Promise<R>,
    deps: DependencyList = [],
    scale = 1,
): AsyncStateRetry<R> {
    const { chainId } = useChainContext()
    const Utils = useWeb3Utils(pluginID)
    return useBeatRetry(fn, Utils.getAverageBlockDelay?.(chainId, scale) ?? DEFAULT_DOUBLE_BLOCK_DELAY, deps)
}
