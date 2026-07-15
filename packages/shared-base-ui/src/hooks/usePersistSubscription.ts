import { useQuery } from '@tanstack/react-query'
import { useDebugValue, useEffect } from 'react'
import type { Subscription } from 'use-subscription'

/**
 * In favor of react-query's persist cache and cache management
 */
export function usePersistSubscription<T>(
    persistKey: `@@${string}`,
    subscription: Subscription<T>,
    predicate?: (data: T) => boolean,
): T {
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    const { data, refetch } = useQuery({
        queryKey: [persistKey],
        networkMode: 'always',
        queryFn: () => {
            return subscription.getCurrentValue()
        },
        select: (data) =>
            data && predicate ?
                predicate(data) ? data
                :   null
            :   data,
        placeholderData: () => subscription.getCurrentValue() as any,
    })
    useEffect(() => {
        refetch() // Actively fetch, make persist data act as placeholder data
        return subscription.subscribe(refetch)
    }, [subscription, refetch])

    useDebugValue(data)

    return data!
}
