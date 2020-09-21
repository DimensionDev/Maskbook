import { useState, useEffect, useMemo } from 'react'
import { useMountedState } from 'react-use'
import { sleep } from '@holoflows/kit/es/util/sleep'

export interface TimesOptions {
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
export function useAsyncTimes<R>(callback: () => Promise<R>, options?: TimesOptions) {
    const {
        times = 30,
        delay = 30 /* seconds */ * 1000 /* milliseconds */,
        timeout = 60 /* seconds*/ * 1000 /* milliseconds */,
        ignoreError = true,
        done = () => false,
    } = options ?? {}

    const isMounted = useMountedState()
    const [result, setResult] = useState<R | void>(undefined)

    // create ticker
    const ticker = useMemo(
        () => async (rest: number) => {
            try {
                const r = await Promise.race([
                    callback(),
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
        },
        [delay, timeout, ignoreError, done],
    )

    // invoke first ticker
    useEffect(() => {
        ticker(times)
    }, [])
    return result
}
