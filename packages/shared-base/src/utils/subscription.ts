import { noop } from 'lodash-unified'
import type { ValueRef } from '@dimensiondev/holoflows-kit'
import type { Subscription } from 'use-subscription'

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
    // 0 - idle, 1 - updating state, > 1 - waiting state
    let beats = 0
    let state = defaultValue
    const { subscribe, trigger } = getEventTarget()
    f()
        .then((v) => (state = v))
        .finally(trigger)
    const flush = async () => {
        state = await f()
        beats -= 1
        if (beats > 0) {
            beats = 1
            setTimeout(flush, 0)
        } else if (beats < 0) {
            beats = 0
        }
        trigger()
    }
    return {
        getCurrentValue: () => state,
        subscribe: (sub) => {
            if (signal?.aborted) return () => {}
            const a = subscribe(sub)
            const b = onChange(async () => {
                beats += 1
                if (beats === 1) flush()
            })
            signal?.addEventListener('abort', () => [a(), b()], { once: true })
            return () => void [a(), b()]
        },
    }
}

function getEventTarget() {
    const event = new EventTarget()
    const EVENT = 'event'
    let timer: ReturnType<typeof setTimeout>
    function trigger() {
        clearTimeout(timer)
        // delay to update state to ensure that all settings to be synced globally
        timer = setTimeout(() => event.dispatchEvent(new Event(EVENT)), 600)
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
