export async function asyncIteratorToArray<T>(iterable?: AsyncIterable<T>) {
    if (!iterable) return []
    const arr: T[] = []
    for await (const x of iterable) arr.push(x)
    return arr
}

export async function* asyncIteratorMerge<T>(iterables: Array<AsyncIterable<T>>) {
    for (const x of iterables) yield* x
}
