import { DependencyList, useCallback, useEffect, useState } from 'react'
import { useAsyncRetry, useList } from 'react-use'
import type { AsyncStateRetry } from 'react-use/lib/useAsyncRetry.js'

export interface Pageable<Item, Indicator = unknown> {
    /** the indicator of the current page */
    indicator: Indicator
    /** the indicator of the next page */
    nextIndicator?: Indicator
    /** items data */
    data: Item[]
}

export type AsyncStatePageable<T> = AsyncStateRetry<T> & {
    next(): void
    ended: boolean
}

export const usePageableAsync = <T>(
    fn: (nextIndicator?: unknown) => Promise<Pageable<T, unknown> | undefined>,
    deps: DependencyList = [],
) => {
    const [indicator, setIndicator] = useState<unknown>()
    const [list, { push }] = useList()

    const state = useAsyncRetry(() => fn(indicator), [...deps, indicator])

    const stateValue = state?.value
    const stateNextIndicator = state.value?.nextIndicator

    useEffect(() => push(...(stateValue?.data ?? [])), [stateValue])

    const next = useCallback(() => {
        if (state.loading || !stateNextIndicator) return
        if (state.error) {
            state.retry()
        } else {
            setIndicator(stateNextIndicator)
        }
    }, [...deps, state, stateNextIndicator])

    return { ...state, value: list, next, ended: !stateNextIndicator }
}
