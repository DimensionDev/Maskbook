import { ValueRef, GetContext } from '@dimensiondev/holoflows-kit/es'
import { Subscription, useSubscription } from 'use-subscription'
import { useMemo } from 'react'
export function useValueRef<T>(ref: ValueRef<T>) {
    if (GetContext() === 'background') throw new Error('Illegal context')
    const subscription = useMemo<Subscription<T>>(
        () => ({
            getCurrentValue: () => ref.value,
            subscribe: (callback) => ref.addListener(callback),
        }),
        [ref],
    )

    return useSubscription(subscription)
}
