import { DependencyList, useState } from 'react'
import { useAsyncRetry, useTimeoutFn } from 'react-use'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import type { AsyncStateRetry } from 'react-use/lib/useAsyncRetry'
import { useWeb3State } from './useWeb3State'
import { useChainId } from './useChainId'

const DEFAULT_SINGLE_BLOCK_DELAY = 15 * 1000
const DEFAULT_DOUBLE_BLOCK_DELAY = DEFAULT_SINGLE_BLOCK_DELAY * 2

export function useBeat(delay = 1000) {
    const [beat, setBeat] = useState(0)
    const [, , reset] = useTimeoutFn(() => {
        setBeat((x) => (x + 1) % Number.MAX_SAFE_INTEGER)
        reset()
    }, delay)
    return beat
}

export function useBeatRetry<T>(fn: () => Promise<T>, delay = 1000, deps: DependencyList = []): AsyncStateRetry<T> {
    const beat = useBeat(delay)
    return useAsyncRetry(fn, deps.concat(beat))
}

export function useSingleBlockBeatRetry<T extends NetworkPluginID, R>(
    pluginID: T,
    fn: () => Promise<R>,
    deps: DependencyList = [],
): AsyncStateRetry<R> {
    const chainId = useChainId(pluginID)
    const { Others } = useWeb3State(pluginID)
    // @ts-ignore
    return useBeatRetry(fn, Others?.getAverageBlockDelay?.(chainId) ?? DEFAULT_SINGLE_BLOCK_DELAY, deps)
}

export function useDoubleBlockBeatRetry<T extends NetworkPluginID, R>(
    pluginID: T,
    fn: () => Promise<R>,
    deps: DependencyList = [],
): AsyncStateRetry<R> {
    const chainId = useChainId(pluginID)
    const { Others } = useWeb3State(pluginID)
    // @ts-ignore
    return useBeatRetry(fn, Others?.getAverageBlockDelay?.(chainId, 2) ?? DEFAULT_DOUBLE_BLOCK_DELAY, deps)
}
