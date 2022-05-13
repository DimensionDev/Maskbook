import { useMemo } from 'react'
import type { Subscription } from '@masknet/shared-base'
import { useSyncExternalStoreWithSelector } from 'use-sync-external-store/shim/with-selector'
import type { ValueRef } from '@dimensiondev/holoflows-kit'

export function useValueRef<T>(ref: ValueRef<T>) {
    const subscription = useMemo<Subscription<T>>(
        () => ({
            getCurrentValue: () => ref.value,
            subscribe: (callback) => ref.addListener(callback),
        }),
        [ref],
    )

    return useSyncExternalStoreWithSelector(
        subscription.subscribe,
        subscription.getCurrentValue,
        subscription.getCurrentValue,
        (s) => s,
    )
}

export function useValueRefDelayed<T>(ref: ValueRef<T>, latency = 500) {
    const subscription = useMemo<Subscription<T>>(
        () => ({
            getCurrentValue: () => ref.value,
            subscribe: (callback: (newVal: T, oldVal: T) => void) => {
                return ref.addListener((newVal, oldVal) => {
                    setTimeout(() => callback(newVal, oldVal), latency)
                })
            },
        }),
        [ref, latency],
    )

    return useSyncExternalStoreWithSelector(
        subscription.subscribe,
        subscription.getCurrentValue,
        subscription.getCurrentValue,
        (s) => s,
    )
}
