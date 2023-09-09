import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useSubscription, type Subscription } from 'use-subscription'

/**
 * In favor of react-query's persist cache and cache management
 */
export function usePersistSubscription<T>(persistKey: `@@${string}`, subscription: Subscription<T>): T {
    const [initialValue] = useState(() => subscription.getCurrentValue())
    const { data = initialValue, refetch } = useQuery({
        queryKey: [persistKey],
        queryFn: () => subscription.getCurrentValue(),
    })
    useEffect(() => {
        return subscription.subscribe(refetch)
    }, [subscription, refetch])

    // useSubscription is still more reliable, some subscription initial with
    // data like empty string, e.g. Providers[ProviderType.MaskWallet].subscription.account
    const sub = useSubscription(subscription)

    return sub ?? data
}
