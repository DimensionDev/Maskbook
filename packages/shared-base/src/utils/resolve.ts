export type Unresolved<T, P = never> = T | ((options?: P) => T)

export function resolve<T, P = never>(unresolved: Unresolved<T, P>, options?: P): T {
    if (typeof unresolved !== 'function') return unresolved
    const unresolvedFunction = unresolved as (options?: P) => T
    return unresolvedFunction(options)
}
