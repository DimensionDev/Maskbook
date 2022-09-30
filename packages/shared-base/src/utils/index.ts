export * from './asyncIterator.js'
export * from './mixin.js'
export * from './detect.js'
export * from './getLocalImplementation.js'
export * from './parseURLs.js'
export * from './pollingTask.js'
export * from './subscription.js'
export * from './getAssetAsBlobURL.js'
export * from './personas.js'
export * from './createValueRefWithReady.js'
export * from './misc.js'

export enum MimeTypes {
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
