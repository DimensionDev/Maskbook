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
