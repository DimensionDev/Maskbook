import { isUndefined } from 'lodash-es'

export function createPredicate<T, P extends T>(candidates: T[]) {
    return (candidate?: unknown): candidate is P => !!candidate && candidates.includes(candidate as T)
}

export async function attemptUntil<T>(
    funcs: Array<() => Promise<T> | undefined>,
    fallback: T,
    predicator: (result: Awaited<T> | undefined) => boolean = isUndefined,
) {
    const errors: Error[] = []

    for (const func of funcs) {
        try {
            const result = await func()
            if (predicator(result)) {
                continue
            }
            return result ?? fallback
        } catch (error) {
            errors.push(error as Error)
            continue
        }
    }

    if (errors.length) throw new AggregateError(errors, 'At least one of the attempts fails.')
    return fallback
}
