import { atom, useAtom } from 'jotai'
import { useRef, unstable_useTransition, useCallback } from 'react'
import { Result } from 'ts-results'
import type {} from 'react/experimental'

export type SuspendedAsync<Args extends unknown[], R> = readonly [
    result: Result<R, unknown>,
    newArgs: (...args: Args) => void,
    isPending: boolean,
]

export function createSuspended<Args extends unknown[], R>(f: (...args: Args) => Promise<R>) {
    return function useAsyncSuspended(opts: { init: Args }): SuspendedAsync<Args, R> {
        const [startTransition, isPending] = unstable_useTransition()

        const { args, result } = useRef(createAtom(f, opts.init)).current
        const [, applyArgs] = useAtom(args)

        return [
            useAtom(result)[0],
            useCallback((...a: Args) => startTransition(() => void applyArgs(a)), []),
            isPending,
        ]
    }
}

function createAtom<Args extends unknown[], R>(f: (...args: Args) => Promise<R>, init: Args) {
    const args = atom(init)
    const result = atom((get) => Result.wrapAsync(() => f(...get(args))))
    return { result, args }
}
