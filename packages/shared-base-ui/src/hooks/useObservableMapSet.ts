import { useMemo } from 'react'
import { useSubscription, Subscription } from 'use-subscription'
import { ALL_EVENTS, ObservableMap, ObservableSet } from '@masknet/shared-base'

export function useObservableValues<T>(map: ObservableMap<any, T> | ObservableSet<T>) {
    const subscription = useMemo<Subscription<T[]>>(
        () => ({
            getCurrentValue: () => [...map.values()],
            subscribe: (callback) => {
                return (map.event.on as any)(ALL_EVENTS, callback)
            },
        }),
        [map],
    )

    return useSubscription(subscription)
}
