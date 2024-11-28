import { useQuery } from '@tanstack/react-query'
import { useDebugValue, useEffect } from 'react'
import { type Subscription } from 'use-subscription'

/**
 * In favor of react-query's persist cache and cache management
 */
export function usePersistSubscription<T>(
    persistKey: `@@${string}`,
    subscription: Subscription<T>,
    predicate?: (data: T) => boolean,
): T {
    const { data, refetch } = useQuery({
        // eslint-disable-next-line @tanstack/query/exhaustive-deps
        queryKey: [persistKey],
        networkMode: 'always',
        queryFn: () => {
            const value = subscription.getCurrentValue()
            if (predicate && !predicate(value)) return null
            return value
        },
        placeholderData: () => subscription.getCurrentValue() as any,
    })
    useEffect(() => {
        refetch() // Actively fetch, make persist data act as placeholder data
        return subscription.subscribe(refetch)
    }, [subscription, refetch])

    useDebugValue(data)

    return data!
}
