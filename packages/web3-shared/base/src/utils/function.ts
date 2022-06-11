import { attempt, isError } from 'lodash-unified'

export function createPredicate<T, P extends T>(candidates: T[]) {
    return (candidate?: unknown): candidate is P => !!candidate && candidates.includes(candidate as T)
}

export async function attemptUntil<T>(funcs: Array<() => Promise<T>>, fallback: T) {
    for (const func of funcs) {
        try {
            return await func()
        } catch {
            continue
        }
    }
    return fallback
}
