import { useSubscription, Subscription } from 'use-subscription'
import { useMemo } from 'react'
import type { ObservableMap, ObservableSet } from '../ObservableMapSet'

export function useObservableValues<T>(map: ObservableMap<any, T> | ObservableSet<T>) {
    const subscription = useMemo<Subscription<T[]>>(
        () => ({
            getCurrentValue: () => [...map.values()],
            subscribe: (callback) => {
                map.event.each(callback)
                return () => map.event.none(callback)
            },
        }),
        [map],
    )

    return useSubscription(subscription)
}
