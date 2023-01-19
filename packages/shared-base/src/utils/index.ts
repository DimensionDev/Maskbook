export * from './asyncIterator.js'
export * from './detect.js'
export * from './file.js'
export * from './getLocalImplementation.js'
export * from './markdown.js'
export * from './mixin.js'
export * from './personas.js'
export * from './subscription.js'
export * from './ValueRef.js'

export enum SignType {
    Message = 'message',
    TypedData = 'typedData',
    Transaction = 'transaction',
}

export enum MimeType {
    JSON = 'application/json',
    Binary = 'application/octet-stream',
}

export type PartialRequired<T, RequiredKeys extends keyof T> = Omit<T, RequiredKeys> & Pick<Required<T>, RequiredKeys>

export function createLookupTableResolver<K extends keyof any, T>(map: Record<K, T>, fallback: T | ((key: K) => T)) {
    function resolveFallback(key: K) {
        if (typeof fallback === 'function') return (fallback as (key: K) => T)(key)
        return fallback
    }
    return (key: K) => map[key] ?? resolveFallback(key)
}

export function compose<T>(...args: [...composer: Array<((arg: T) => T) | null | false>, init: T]) {
    if (args.length === 0) throw new TypeError()
    const last = args.pop() as T
    // eslint-disable-next-line unicorn/no-array-reduce
    return (args as Array<((arg: T) => T) | null>).filter(Boolean).reduceRight((prev, fn) => fn!(prev), last)
}
