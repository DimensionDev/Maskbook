import { noop } from 'lodash-es'
import type { Subscription } from 'use-subscription'
import { None, type Option, Some } from 'ts-results-es'
import type { ValueRef } from '@masknet/shared-base'

export async function getSubscriptionCurrentValue<T>(
    getSubscription: () => Subscription<T> | undefined,
    retries = 3,
): Promise<T | undefined> {
    const getValue = () => {
        return getSubscription()?.getCurrentValue()
    }

    const createReader = async () => {
        try {
            return getValue()
        } catch (error: unknown) {
            if (!(error instanceof Promise)) return
            await error
            return getValue()
        }
    }

    const createReaders = Array.from<() => Promise<T | undefined>>({ length: retries }).fill(() => createReader())

    for (const createReader of createReaders) {
        try {
            return await createReader()
        } catch {
            continue
        }
    }
    return
}

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
            // TODO: suspense
            if (value.isNone()) throw promise
            return value.value
        },
        subscribe: (sub: () => void) => {
            if (signal?.aborted) return noop

            const undo = subscribe(sub)
            signal?.addEventListener('abort', undo, { once: true })
            return () => {
                undo()
            }
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
    let value: Option<Q> = None
    sub.subscribe(() => (value = None))
    return {
        getCurrentValue() {
            if (value.isNone()) value = Some(mapper(sub.getCurrentValue()))
            return value.value
        },
        subscribe: sub.subscribe,
    }
}

export function mergeSubscription<T extends Array<Subscription<unknown>>>(
    ...subscriptions: T
): Subscription<{
    [key in keyof T]: T[key] extends Subscription<infer U> ? U : never
}> {
    let values: any[] | undefined
    const f = () => (values = undefined)
    subscriptions.forEach((x) => x.subscribe(f))
    return {
        getCurrentValue() {
            return (values ??= subscriptions.map((x) => x.getCurrentValue())) as any
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
