const CACHE = new Map<
    string,
    {
        timestamp: number
        result: Promise<unknown>
    }
>()

export function squashPromise<T>(key: string, func: () => Promise<T>, expiration = 600) {
    return (...args: Parameters<typeof func>) => {
        const hit = CACHE.get(key)
        if (hit && hit.timestamp + expiration > Date.now()) return hit.result as Promise<T>

        const result = func(...args)

        CACHE.set(key, {
            timestamp: Date.now(),
            result,
        })

        return result
    }
}
