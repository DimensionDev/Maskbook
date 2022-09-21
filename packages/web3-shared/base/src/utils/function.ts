import { last } from 'lodash-unified'

export function createPredicate<T, P extends T>(candidates: T[]) {
    return (candidate?: unknown): candidate is P => !!candidate && candidates.includes(candidate as T)
}

export async function attemptUntil<T>(funcs: Array<() => Promise<T> | undefined>, fallback: T, withError?: boolean) {
    for (const func of funcs) {
        try {
            const result = await func()
            if (typeof result === 'undefined') continue
            return result
        } catch (error) {
            if (func === last(funcs) && withError) {
                throw error
            }
            continue
        }
    }
    return fallback
}
