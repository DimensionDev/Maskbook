export type Unresolved<T, P = never> = T | ((options?: P) => T)

export function resolve<T, P>(unresolved: Unresolved<T, P>, options?: P): T {
    if (typeof unresolved !== 'function') return unresolved
    const unresolveFunction = unresolved as (options?: P) => T
    return unresolveFunction(options)
}
