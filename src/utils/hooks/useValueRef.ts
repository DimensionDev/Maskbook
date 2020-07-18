import type { ValueRef } from '@holoflows/kit/es'
import { useMemo } from 'react'
import { Subscription, useSubscription } from 'use-subscription'

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
