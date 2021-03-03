import { useState, useEffect, useMemo, useRef } from 'react'
import { useMountedState } from 'react-use'
import { delay as sleep } from '../utils'

export interface AsyncTimesOptions {
    delay?: number
    times?: number
    timeout?: number
    done?: () => boolean
    ignoreError?: boolean
}

/**
 * Invoke callback n times
 * @param callback
 * @param options
 */
export function useAsyncTimes<R>(callback: () => Promise<R>, options?: AsyncTimesOptions) {
    const {
        times = 30,
        delay = 30 /* seconds */ * 1000 /* milliseconds */,
        timeout = 60 /* seconds*/ * 1000 /* milliseconds */,
        ignoreError = true,
        done = () => false,
    } = options ?? {}

    //#region only callback is reactive
    const savedCallback = useRef<(() => Promise<R>) | null>(null)
    useEffect(() => {
        savedCallback.current = callback
    })
    //#endregion

    // create ticker
    const isMounted = useMountedState()
    const [result, setResult] = useState<R | void>(undefined)
    const ticker = useMemo(() => {
        return async (rest: number) => {
            try {
                const r = await Promise.race([
                    savedCallback.current?.(),
                    new Promise<void>((_, reject) => {
                        setTimeout(() => reject(new Error('timeout')), timeout)
                    }),
                ])
                if (isMounted()) setResult(r)
            } catch (e) {
                if (!ignoreError) setResult(undefined)
            } finally {
                if (rest <= 0 || done()) return
                await sleep(delay)
                if (isMounted()) ticker(rest - 1)
            }
        }
    }, [delay, timeout, ignoreError, done])

    // invoke ticker at the first time
    useEffect(() => {
        ticker(times)
    }, [])
    return result
}
