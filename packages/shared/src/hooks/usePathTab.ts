import { useRenderPhraseCallbackOnDepsChange } from '@masknet/shared-base-ui'
import { sortBy, uniq } from 'lodash-es'
import { useCallback, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

export type TabPathTuple = [
    tab: string,
    path: string,
    ...paths: Array<string | ((pathname: string) => string | undefined)>,
]
export function usePathTab(tuples: TabPathTuple[], keepSearch = false) {
    const navigate = useNavigate()
    const location = useLocation()
    const { pathname, search } = location

    const [history, setHistory] = useState<string[]>([])
    useRenderPhraseCallbackOnDepsChange(() => {
        setHistory((stack) => {
            return uniq([pathname, ...stack])
        })
    }, [pathname])

    // Put the last matched route in the first position of each tuple
    // to keep the last visited tab in nested route.
    const dynamicTuples: TabPathTuple[] = useMemo(() => {
        return tuples.map((pair) => {
            if (pair.length === 2) return pair
            const [tab, ...paths] = pair
            return [
                tab,
                ...sortBy(paths, (route) => (typeof route === 'string' ? history.indexOf(route) : paths.length)),
            ] as TabPathTuple
        })
    }, [tuples, history])

    const firstTuple = dynamicTuples[0]
    const [tab] =
        dynamicTuples.find(([, ...paths]) => {
            return paths.find((x) => (typeof x === 'string' ? x === pathname : x(pathname)))
        }) || firstTuple

    const handleTabChange = useCallback(
        (_: unknown, tab: string) => {
            const tuple = dynamicTuples.find((pair) => pair[0] === tab) || firstTuple
            const path = tuple[1] as string
            navigate(keepSearch ? `${path}${search}` : path, { replace: true })
        },
        [navigate, keepSearch, search, dynamicTuples],
    )

    return [tab, handleTabChange] as const
}
