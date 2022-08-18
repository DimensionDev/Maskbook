export function createPredicate<T, P extends T>(candidates: T[]) {
    return (candidate?: unknown): candidate is P => !!candidate && candidates.includes(candidate as T)
}

export async function attemptUntil<T>(funcs: Array<() => Promise<T> | undefined>, fallback: T) {
    for (const func of funcs) {
        try {
            const result = await func()
            if (typeof result === 'undefined') continue
            return result
        } catch {
            continue
        }
    }
    return fallback
}
