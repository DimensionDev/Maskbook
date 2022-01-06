import { DependencyList, useState } from 'react'
import { useAsyncRetry, useTimeoutFn } from 'react-use'
import type { AsyncStateRetry } from 'react-use/lib/useAsyncRetry'

export const SINGLE_BLOCK_DELAY = 15 * 1000
export const DOUBLE_BLOCK_DELAY = SINGLE_BLOCK_DELAY * 2

export function useBeat(delay = 1000) {
    const [bit, setBit] = useState(0)
    const [, , reset] = useTimeoutFn(() => {
        setBit((x) => (x + 1) % Number.MAX_SAFE_INTEGER)
        reset()
    }, delay)
    return bit
}

export function useBeatRetry<T>(fn: () => Promise<T>, delay = 1000, deps: DependencyList = []): AsyncStateRetry<T> {
    const beat = useBeat(delay)
    return useAsyncRetry(fn, [beat].concat(deps))
}
