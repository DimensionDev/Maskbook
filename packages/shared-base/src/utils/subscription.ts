import { noop } from 'lodash-es'
import type { Subscription, Unsubscribe } from 'use-subscription'
import type { StorageObject } from '..'

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
            const a = subscribe(sub)
            const b = onChange(async () => {
                beats += 1
                if (beats === 1) flush()
            })
            return () => void [a(), b()]
        },
    }
}

function getEventTarget() {
    const event = new EventTarget()
    const EVENT = 'event'
    let timer: NodeJS.Timeout
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

export function createSubscriptionFromScopedStorage<T, S extends object>(
    storage: StorageObject<S>,
    valueGetter: (storage: StorageObject<S>) => T,
    subscribeGetter: (storage: StorageObject<S>) => (callback: () => void) => Unsubscribe,
): Subscription<T> {
    return {
        getCurrentValue: () => {
            return valueGetter(storage)
        },
        subscribe: subscribeGetter(storage),
    }
}
