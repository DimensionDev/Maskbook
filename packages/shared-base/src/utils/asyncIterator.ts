export async function asyncIteratorToArray<T>(iterable?: AsyncIterable<T>) {
    if (!iterable) return []
    const arr: T[] = []
    for await (const x of iterable) arr.push(x)
    return arr
}
