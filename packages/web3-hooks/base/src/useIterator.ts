import { useCallback, useState, useEffect } from 'react'
import { useUpdateEffect } from 'react-use'
import type { AsyncStateRetry } from 'react-use/lib/useAsyncRetry.js'
import { EMPTY_LIST } from '@masknet/shared-base'

export function useIterator<T>(
    iterator: AsyncGenerator<T | Error, void, undefined> | undefined,
    size = 50,
): AsyncStateRetry<T[]> & { done: boolean; next: () => Promise<void> } {
    const [done, setDone] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<Error>()
    const [data, setData] = useState<T[]>(EMPTY_LIST)
    const next = useCallback(async () => {
        if (!iterator || done) return
        const batchFollowers: T[] = []
        setLoading(true)
        try {
            for (const _ of Array.from({ length: size })) {
                const { value, done: iteratorDone } = await iterator.next()
                if (value instanceof Error) {
                    setError(value)
                    break
                }
                if (iteratorDone) {
                    setDone(true)
                    break
                }
                if (value) {
                    batchFollowers.push(value)
                }
            }
        } catch (error_) {
            if (error_ instanceof Error) {
                setError(error_)
            } else {
                setError(new Error('Unknown Error'))
            }
            setDone(true)
        }
        setData((pred) => [...pred, ...batchFollowers])
        setLoading(false)
    }, [iterator, done])

    const retry = useCallback(() => {
        setError(undefined)
        setData(EMPTY_LIST)
        setDone(false)
    }, [])

    useUpdateEffect(() => {
        if (!iterator) return
        setData([])
        setDone(false)
        setLoading(false)
    }, [iterator])

    useEffect(() => {
        if (next) next()
    }, [next])

    if (loading) {
        return {
            retry,
            next,
            done,
            loading,
            value: data,
        }
    }

    if (error) {
        return {
            retry,
            next,
            done,
            loading: false,
            error,
        }
    }

    return {
        retry,
        next,
        value: data,
        done,
        loading,
    }
}
