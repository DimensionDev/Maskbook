import { useEffect, useState } from 'react'
import { useBoolean, useInterval } from 'react-use'
import { uniqBy } from 'lodash-unified'

export enum IteratorCollectorState {
    init = 'init',
    fetching = 'fetching',
    done = 'done',
    error = 'error',
}

export const useIteratorCollector = <T>(iterator?: AsyncIterableIterator<T[]>, distinctBy?: (data: T) => string) => {
    const [cache, setCache] = useState<{ data: T[]; status: IteratorCollectorState }>()
    const [isRunning, toggleIsRunning] = useBoolean(true)
    const [delay] = useState(1000)

    useEffect(() => {
        toggleIsRunning(true)
        setCache({
            data: [],
            status: IteratorCollectorState.init,
        })
    }, [iterator])

    useInterval(
        async () => {
            try {
                if (!iterator) return
                const result = await iterator.next()
                const { value, done } = result

                if (done) {
                    toggleIsRunning(false)
                } else {
                    const newData = {
                        data: uniqBy([...(cache?.data ?? []), ...value], (x) => (!distinctBy ? true : distinctBy(x))),
                        status: result.done ? IteratorCollectorState.done : IteratorCollectorState.fetching,
                    }
                    setCache(newData)
                }
            } catch {
                const exist = cache?.data ?? []
                const newData = {
                    data: exist,
                    status: IteratorCollectorState.error,
                }
                setCache(newData)
            }
        },
        isRunning && iterator ? delay : null,
    )

    return cache ?? { data: [], status: IteratorCollectorState.init }
}
