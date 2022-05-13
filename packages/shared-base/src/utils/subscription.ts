import { noop } from 'lodash-unified'
import type { ValueRef } from '@dimensiondev/holoflows-kit'
import { None, Option, Some } from 'ts-results'

type Unsubscribe = () => void

export interface Subscription<T> {
    /**
     * (Synchronously) returns the current value of our subscription.
     */
    getCurrentValue: () => T
    /**
     * This function is passed an event handler to attach to the subscription.
     * It must return an unsubscribe function that removes the handler.
     */
    subscribe: (callback: () => void) => Unsubscribe
}

export function createConstantSubscription<T>(value: T) {
    return {
        getCurrentValue: () => value,
        subscribe: () => noop,
    }
}

export function createSubscriptionFromAsync<T>(
    f: () => Promise<T>,
    defaultValue: T,
    onChange: (callback: () => void) => () => void,
    signal?: AbortSignal,
): Subscription<T> {
    const { getCurrentValue, subscribe } = createSubscriptionFromAsyncSuspense(f, onChange, signal)
    return {
        subscribe,
        getCurrentValue: () => {
            try {
                return getCurrentValue()
            } catch {
                return defaultValue
            }
        },
    }
}

export function createSubscriptionFromAsyncSuspense<T>(
    f: () => Promise<T>,
    onChange: (callback: () => void) => () => void,
    signal?: AbortSignal,
): Subscription<T> {
    const { subscribe, trigger } = getEventTarget()

    let value: Option<T> = None
    const setter = (v: T) => {
        value = Some(v)
        trigger()
    }
    // initial request
    const promise = f().then(setter)

    // follow-up updating
    const listen = onChange(() => f().then(setter))
    signal?.addEventListener('abort', listen, { once: true })

    return {
        getCurrentValue: () => {
            if (value.none) throw promise
            return value.val
        },
        subscribe: (sub: () => void) => {
            if (signal?.aborted) return noop

            const undo = subscribe(sub)
            signal?.addEventListener('abort', undo, { once: true })
            return () => void undo()
        },
    }
}

function getEventTarget() {
    const event = new EventTarget()
    const EVENT = 'event'
    let timer: ReturnType<typeof setTimeout>
    function trigger() {
        clearTimeout(timer)
        // delay to update state to ensure that all data to be synced globally
        timer = setTimeout(() => event.dispatchEvent(new Event(EVENT)), 500)
    }
    function subscribe(f: () => void) {
        event.addEventListener(EVENT, f)
        return () => event.removeEventListener(EVENT, f)
    }
    return { trigger, subscribe }
}

export function mapSubscription<T, Q>(sub: Subscription<T>, mapper: (val: T) => Q): Subscription<Q> {
    return {
        getCurrentValue() {
            return mapper(sub.getCurrentValue())
        },
        subscribe: sub.subscribe,
    }
}

export function createSubscriptionFromValueRef<T>(ref: ValueRef<T>, signal?: AbortSignal): Subscription<T> {
    return SubscriptionDebug({
        getCurrentValue: () => ref.value,
        subscribe: (sub) => {
            if (signal?.aborted) return noop
            const f = ref.addListener(sub)
            signal?.addEventListener('abort', f, { once: true })
            return f
        },
    })
}
export function SubscriptionDebug<T>(x: Subscription<T>): Subscription<T> {
    Object.defineProperty(x, '_value', {
        configurable: true,
        get: () => x.getCurrentValue(),
    })
    return x
}
