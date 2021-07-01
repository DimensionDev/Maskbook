import { ValueRef } from '@dimensiondev/holoflows-kit'
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

export function SubscriptionFromValueRef<T>(ref: ValueRef<T>): Subscription<T> {
    return {
        getCurrentValue: () => ref.value,
        subscribe: (sub) => ref.addListener(sub),
    }
}

export function ValueRefFromSubscription<T>(sub: Subscription<T>, eq?: (a: T, b: T) => boolean): ValueRef<T> {
    const ref = new ValueRef(sub.getCurrentValue(), eq)
    sub.subscribe(() => (ref.value = sub.getCurrentValue()))
    return ref
}
