import { use, useDebugValue, useEffect, useSyncExternalStore } from 'react'
import type { ValueRef, ValueRefJSON, ValueRefWithReady } from '@masknet/shared-base'
import { useQuery } from '@tanstack/react-query'

function getServerSnapshot(): never {
    throw new Error('getServerSnapshot is not supported')
}
export function useValueRef<T>(ref: ValueRef<T>): T {
    if ('readyPromise' in ref) {
        const ref2 = ref as ValueRefWithReady<T>
        if (!ref2.ready) use(ref2.readyPromise)
    }
    return useSyncExternalStore(
        (f) => ref.addListener(f),
        () => ref.value,
        getServerSnapshot,
    )
}
export function useValueRefReactQuery<T>(key: `@@${string}`, ref: ValueRefWithReady<T>) {
    const { data, refetch } = useQuery({
        queryKey: [key],
        queryFn: async () => {
            await ref.readyPromise
            return ref.value ?? null
        },
        placeholderData: () => ref.value as any,
        networkMode: 'always',
    })
    useEffect(() => {
        refetch()
        return ref.addListener(() => refetch())
    }, [refetch, ref])
    useDebugValue(data)
    return data
}

/** @deprecated */
export function useValueRefJSON<T extends object>(ref: ValueRefJSON<T>): Readonly<T> {
    return useSyncExternalStore(
        (f) => ref.addListener(f),
        () => ref.asJSON,
    )
}
