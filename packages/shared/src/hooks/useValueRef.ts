import type { ValueRef } from '@dimensiondev/holoflows-kit'
import { Subscription, useSubscription } from 'use-subscription'
import { useMemo } from 'react'

export function useValueRef<T>(ref: ValueRef<T>) {
    const subscription = useMemo<Subscription<T>>(
        () => ({
            getCurrentValue: () => ref.value,
            subscribe: (callback) => ref.addListener(callback),
        }),
        [ref],
    )

    return useSubscription(subscription)
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

    return useSubscription(subscription)
}
