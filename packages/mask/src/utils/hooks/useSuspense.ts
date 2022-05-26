import { useUpdate } from 'react-use'

export function useSuspense<T, U extends Array<any>>(
    id: string,
    args: U,
    cache: Map<string, [0, Promise<void>] | [1, T] | [2, Error]>,
    Suspender: (...args: U) => Promise<T>,
) {
    const forceUpdate = useUpdate()
    const rec = cache.get(id)
    if (!rec) {
        const p = Suspender(...args)
            .then((val) => void cache.set(id, [1, val]))
            .catch((error) => void cache.set(id, [2, error]))
        cache.set(id, [0, p])
        throw p
    }
    if (rec[0] === 1)
        return {
            payload: rec[1],
            retry: () => {
                if (cache.has(id)) cache.delete(id)
                forceUpdate()
            },
        }
    throw rec[1]
}
