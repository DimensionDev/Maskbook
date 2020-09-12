import { useState, useEffect, useMemo } from 'react'
import { sleep } from '@holoflows/kit/es/util/sleep'
import { useMountedState } from 'react-use'

export interface TimesOptions {
    delay?: number
    times?: number
    timeout?: number
    done?: () => boolean
    ignoreError?: boolean
}

/**
 * Call callback n times
 * @param callback
 * @param options
 */
export function useTimes<R>(callback: () => Promise<R>, options?: TimesOptions) {
    const {
        times = 30,
        delay = 30 /* seconds */ * 1000 /* milliseconds */,
        timeout = 60 /* seconds*/ * 1000 /* milliseconds */,
        ignoreError = true,
        done = () => false,
    } = options ?? {}

    const isMounted = useMountedState()
    const [result, setResult] = useState<R | null>(null)

    // create ticker
    const ticker = useMemo(
        () => async (rest: number) => {
            try {
                const r = await Promise.race([
                    callback(),
                    new Promise<null>((_, reject) => {
                        setTimeout(() => reject(new Error('timeout')), timeout)
                    }),
                ])
                if (isMounted()) setResult(r)
            } catch (e) {
                if (!ignoreError) setResult(null)
            } finally {
                if (rest <= 0 || done()) return
                await sleep(delay)
                if (isMounted()) ticker(rest - 1)
            }
        },
        [],
    )

    // invoke first ticker
    useEffect(() => {
        ticker(times)
    }, [])
    return result
}
