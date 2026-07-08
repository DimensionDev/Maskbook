import { useSubscription, type Subscription } from 'use-subscription'

const noop = () => {}
function createConstantSubscription<T>(value: T): Subscription<T> {
    return {
        getCurrentValue: () => value,
        subscribe: () => noop,
    }
}

export function useSubscriptionMaybe<T>(subscription: Subscription<T> | undefined, defaultValue: T): T {
    return useSubscription(subscription ?? createConstantSubscription(defaultValue))
}
