import type {} from 'react/experimental'
// @ts-expect-error
import { unstable_getCacheForType } from 'react'
export type Status<T> =
    | { type: 'pending'; value: Promise<void> }
    | { type: 'fulfilled'; value: T }
    | { type: 'rejected'; value: unknown }
export interface Resource<T> {
    /** Read the result, might trigger a suspense */
    read(): T
    /** This will not trigger a suspense */
    read_safe(): Status<T>
    /** Return a new resource */
    reload(): Resource<T>
}

export function createResource<Args extends any[], T>(
    f: (...args: Args) => Promise<T>,
    toCacheKey: (...args: Args) => unknown,
    weakMap = false,
): (...args: Args) => Resource<T> {
    function createMap() {
        return weakMap ? new WeakMap() : new Map()
    }
    function create(...args: Args) {
        const key = toCacheKey(...args)
        function read_safe() {
            const cache: Map<unknown, Status<T>> = unstable_getCacheForType(createMap)
            if (!cache.has(key))
                cache.set(key, {
                    type: 'pending',
                    value: f(...args).then(
                        (value) => void cache.set(key, { type: 'fulfilled', value }),
                        (value) => void cache.set(key, { type: 'rejected', value }),
                    ),
                })
            return cache.get(key)!
        }
        return {
            read() {
                const status = read_safe()
                if (status.type === 'fulfilled') return status.value
                throw status.value
            },
            read_safe,
            reload() {
                return create(...args)
            },
        }
    }
    return create
}
