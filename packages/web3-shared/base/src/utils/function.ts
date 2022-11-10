export function createPredicate<T, P extends T>(candidates: T[]) {
    return (candidate?: unknown): candidate is P => !!candidate && candidates.includes(candidate as T)
}

export async function attemptUntil<T>(funcs: Array<() => Promise<T> | undefined>, fallback: T, strict = false) {
    let hasError = false
    for (const func of funcs) {
        try {
            const result = await func()
            if (typeof result === 'undefined' && !strict) continue
            return result ?? fallback
        } catch (error) {
            hasError = true
            continue
        }
    }
    if (hasError) throw new Error('Failed to fetch.')
    return fallback
}
