import type { HubIndicator, Pageable } from '@masknet/web3-shared-base'
import { type DependencyList, useCallback, useEffect, useState } from 'react'
import { useAsyncRetry, useList } from 'react-use'
import type { AsyncStateRetry } from 'react-use/lib/useAsyncRetry.js'

export type AsyncStatePageable<T> = Omit<AsyncStateRetry<T>, 'value'> & {
    value: T[]
    next(): void
    ended: boolean
}

export const usePageableAsync = <T>(
    fn: (nextIndicator?: HubIndicator) => Promise<Pageable<T, unknown> | undefined>,
    deps: DependencyList = [],
    key?: string,
): AsyncStatePageable<T> => {
    const [indicator, setIndicator] = useState<HubIndicator | undefined>()
    const [list, { push, clear }] = useList<T>()

    useEffect(() => clear(), [key])

    const state = useAsyncRetry(() => fn(indicator), [...deps, indicator])

    const stateValue = state?.value
    const stateNextIndicator = state.value?.nextIndicator

    useEffect(() => push(...(stateValue?.data ?? [])), [stateValue])

    const next = useCallback(() => {
        if (state.loading || !stateNextIndicator) return
        if (state.error) {
            state.retry()
        } else {
            setIndicator(stateNextIndicator as HubIndicator)
        }
    }, [...deps, state, stateNextIndicator])

    return { ...state, value: list, next, ended: !stateNextIndicator }
}
