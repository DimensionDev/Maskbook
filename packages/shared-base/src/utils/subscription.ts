import { noop } from 'lodash-unified'
import type { ValueRef } from '@dimensiondev/holoflows-kit'
import type { Subscription } from 'use-subscription'
import { None, Option, Some } from 'ts-results'
import { Emitter } from '@servie/events'

export function createConstantSubscription<T>(value: T): Subscription<T> {
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

interface Events {
    event: []
}

function getEventTarget() {
    // In Firefox, the listener is not triggered after dispatch event with EventTarget
    // So here we use emitter
    const event = new Emitter<Events>()
    const EVENT = 'event'
    let timer: ReturnType<typeof setTimeout>
    function trigger() {
        clearTimeout(timer)
        // delay to update state to ensure that all settings to be synced globally
        timer = setTimeout(() => event.emit(EVENT), 600)
    }
    function subscribe(f: () => void) {
        return event.on(EVENT, f)
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

export function mergeSubscription<T extends Array<Subscription<unknown>>>(
    ...subscriptions: T
): Subscription<{
    [key in keyof T]: T[key] extends Subscription<infer U> ? U : never
}> {
    return {
        getCurrentValue() {
            return subscriptions.map((x) => x.getCurrentValue()) as any
        },
        subscribe: (callback: () => void) => {
            const removeListeners = subscriptions.map((x) => x.subscribe(callback))
            return () => removeListeners.forEach((x) => x())
        },
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
