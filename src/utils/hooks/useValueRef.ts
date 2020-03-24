import { ValueRef, GetContext } from '@holoflows/kit/es'
import { safeReact } from '../safeRequire'
import { Subscription } from 'use-subscription'

export function useValueRef<T>(ref: ValueRef<T>) {
    if (GetContext() === 'background') throw new Error('Illegal context')
    const { useSubscription } = require('use-subscription') as typeof import('use-subscription')
    const { useMemo } = safeReact()

    const subscription = useMemo<Subscription<T>>(
        () => ({
            getCurrentValue: () => ref.value,
            subscribe: (callback) => ref.addListener(callback),
        }),
        [ref],
    )

    return useSubscription(subscription)
}
