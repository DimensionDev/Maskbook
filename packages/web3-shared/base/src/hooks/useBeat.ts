import { DependencyList, useState } from 'react'
import { useAsyncRetry, useTimeoutFn } from 'react-use'
import type { AsyncStateRetry } from 'react-use/lib/useAsyncRetry'

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
