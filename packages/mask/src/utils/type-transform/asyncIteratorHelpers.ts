export async function* asyncIteratorWithResult<T, R, N>(
    iter: AsyncIterator<T, R, N>,
    callback?: (promise: Promise<IteratorResult<T, R>>) => void,
) {
    let yielded: IteratorResult<T, R>
    do {
        const p = iter.next()
        callback?.(p)
        yielded = await p
        yield yielded
    } while (yielded.done === false)
    return
}

export function memorizeAsyncGenerator<Args extends unknown[], T, Return, Next>(
    f: (...args: Args) => AsyncGenerator<T, Return, Next>,
    getKey: (...args: Args) => string,
    expireAfter: number,
): typeof f {
    type Iter = AsyncGenerator<T, Return, Next>
    type IterResult = Promise<IteratorResult<T, Return>>
    const iterCache = new Map<string, Iter>()
    const progressCache = new WeakMap<Iter, IterResult[]>()
    return async function* memorizedAsyncGenerator(...args: Args) {
        const key = getKey(...args)
        const iter = iterCache.get(key) ?? f(...args)
        iterCache.set(key, iter)
        const process = progressCache.get(iter)
        if (!process) {
            setTimeout(() => iterCache.delete(key), expireAfter)
            const arr: IterResult[] = []
            progressCache.set(iter, arr)
            try {
                for await (const _ of asyncIteratorWithResult(iter, (x) => arr.push(x))) {
                    if (_.done) return _.value
                    yield _.value
                }
            } catch {
                iterCache.delete(key)
            }
        } else {
            let index = 0
            while (index < process.length) {
                const p = await process[index]
                if (p.done) return p.value
                yield p.value
                index += 1
            }
        }
        // cache not working
        for await (const _ of asyncIteratorWithResult(f(...args))) {
            if (_.done) return _.value
            yield _.value
        }
        throw new Error('Unreachable')
    }
}

export async function asyncIteratorToArray<T>(it: AsyncIterable<T>) {
    const arr: T[] = []
    for await (const x of it) arr.push(x)
    return arr
}
