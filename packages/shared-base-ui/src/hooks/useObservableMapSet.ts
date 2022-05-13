import { useMemo } from 'react'
import type { Subscription } from '@masknet/shared-base'
import { useSyncExternalStoreWithSelector } from 'use-sync-external-store/shim/with-selector'
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

    return useSyncExternalStoreWithSelector(
        subscription.subscribe,
        subscription.getCurrentValue,
        subscription.getCurrentValue,
        (s) => s,
    )
}
