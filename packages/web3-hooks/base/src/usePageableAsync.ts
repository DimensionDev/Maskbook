import { type DependencyList, useCallback, useEffect, useState } from 'react'
import { useAsyncRetry, useList } from 'react-use'
import type { AsyncStateRetry } from 'react-use/lib/useAsyncRetry.js'
import type { PageIndicator, Pageable } from '@masknet/shared-base'

export type AsyncStatePageable<T> = Omit<AsyncStateRetry<T>, 'value'> & {
    value: T[]
    next(): void
    ended: boolean
}

export const usePageableAsync = <T>(
    fn: (nextIndicator?: PageIndicator) => Promise<Pageable<T> | undefined>,
    deps: DependencyList = [],
    key?: string,
): AsyncStatePageable<T> => {
    const [indicator, setIndicator] = useState<PageIndicator | undefined>()
    const [list, { push, clear }] = useList<T>()

    useEffect(() => clear(), [key])

    const state = useAsyncRetry(() => fn(indicator), [...deps, indicator])

    const stateValue = state.value
    const stateNextIndicator = state.value?.nextIndicator

    useEffect(() => push(...(stateValue?.data ?? [])), [stateValue])

    const next = useCallback(() => {
        if (state.loading || !stateNextIndicator) return
        if (state.error) {
            state.retry()
        } else {
            setIndicator(stateNextIndicator as PageIndicator)
        }
    }, [...deps, state, stateNextIndicator])

    return { ...state, value: list, next, ended: !stateNextIndicator }
}
