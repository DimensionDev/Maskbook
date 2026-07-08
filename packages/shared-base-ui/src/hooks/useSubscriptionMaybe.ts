import { useSubscription, type Subscription } from 'use-subscription'

const noop = () => {}
function createConstantSubscription<T>(value: T): Subscription<T> {
    return {
        getCurrentValue: () => value,
        subscribe: () => noop,
    }
}

const subscriptions = new Map<unknown, Subscription<unknown>>()

export function useSubscriptionMaybe<T>(subscription: Subscription<T> | undefined, defaultValue: T): T {
    if (!subscriptions.has(subscription)) subscriptions.set(subscription, createConstantSubscription(defaultValue))
    return useSubscription(subscription ?? (subscriptions.get(subscription) as Subscription<T>))
}
