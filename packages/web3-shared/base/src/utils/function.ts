import { isUndefined } from 'lodash-es'

export function createPredicate<T, P extends T>(candidates: T[]) {
    return (candidate?: unknown): candidate is P => !!candidate && candidates.includes(candidate as T)
}

export async function attemptUntil<T>(
    funcs: Array<() => Promise<T> | undefined>,
    fallback: T,
    predicator: (result: Awaited<T> | undefined) => boolean = isUndefined,
) {
    let hasError = false
    for (const func of funcs) {
        try {
            const result = await func()
            if (predicator?.(result)) {
                continue
            }
            return result ?? fallback
        } catch (error) {
            hasError = true
            continue
        }
    }
    if (hasError) throw new Error('At least one of the attempts fails.')
    return fallback
}
