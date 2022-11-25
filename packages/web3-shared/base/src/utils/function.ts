export function createPredicate<T, P extends T>(candidates: T[]) {
    return (candidate?: unknown): candidate is P => !!candidate && candidates.includes(candidate as T)
}

export async function attemptUntil<T>(funcs: Array<() => Promise<T> | undefined>, fallback: T, strict = false) {
    let hasError: Error | null = null
    for (const func of funcs) {
        try {
            const result = await func()
            if (typeof result === 'undefined' && !strict) continue
            return result ?? fallback
        } catch (error) {
            hasError = error as Error
            continue
        }
    }
    if (hasError) throw new Error('At least one of the attempts fails.')
    return fallback
}
