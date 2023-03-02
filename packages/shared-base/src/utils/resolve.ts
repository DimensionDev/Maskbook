export type Unresolved<T> = T | (() => T)

export function resolve<T>(unresolved: Unresolved<T>): T {
    if (typeof unresolved !== 'function') return unresolved
    // @ts-ignore
    return unresolved() as T
}
