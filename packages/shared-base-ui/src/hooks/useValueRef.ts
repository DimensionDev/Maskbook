import { useMemo } from 'react'
import { Subscription, useSubscription } from 'use-subscription'
import type { ValueRef } from '@masknet/shared-base'

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
