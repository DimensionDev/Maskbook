import { useSubscription, Subscription } from 'use-subscription'
import { useMemo } from 'react'
import type { ObservableMap, ObservableSet } from '@masknet/shared-base'

export function useObservableValues<T>(map: ObservableMap<any, T> | ObservableSet<T>) {
    const subscription = useMemo<Subscription<T[]>>(
        () => ({
            getCurrentValue: () => [...map.values()],
            subscribe: (callback) => {
                // @ts-ignore
                return map.event.on(ALL_EVENTS, callback)
            },
        }),
        [map],
    )

    return useSubscription(subscription)
}
