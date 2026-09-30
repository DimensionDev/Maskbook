import { use, useDebugValue, useEffect, useSyncExternalStore } from 'react'
import type { ValueRef, ValueRefWithReady } from '@masknet/shared-base'
import { useQuery } from '@tanstack/react-query'

function getServerSnapshot(): never {
    throw new Error('getServerSnapshot is not supported')
}
export function useValueRef<T>(ref: ValueRef<T>): T {
    if ('readyPromise' in ref) {
        // Must NOT be conditional on `ref.ready`. When a component suspends here and is replayed
        // after the promise resolves, React only switches from the update dispatcher back to the
        // mount dispatcher inside `use`. Skipping `use` on replay (because `ready` flipped to true)
        // makes the following hooks throw "Update hook called on initial render" (React #467).
        // `use` on an already-resolved promise returns synchronously once React has tracked it.
        use((ref as ValueRefWithReady<T>).readyPromise)
    }
    return useSyncExternalStore(
        (f) => ref.addListener(f),
        () => ref.value,
        getServerSnapshot,
    )
}
export function useValueRefReactQuery<T>(key: `@@${string}`, ref: ValueRefWithReady<T>) {
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
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
