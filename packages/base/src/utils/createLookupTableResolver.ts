export function createLookupTableResolver<K extends keyof any, T>(map: Record<K, T>, fallback: T | ((key: K) => T)) {
    function resolveFallback(key: K) {
        if (typeof fallback === 'function') return (fallback as (key: K) => T)(key)
        return fallback
    }
    return (key: K) => map[key] ?? resolveFallback(key)
}
