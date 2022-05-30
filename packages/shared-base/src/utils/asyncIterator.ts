export async function asyncIteratorToArray<T>(iterable: AsyncIterable<T>) {
    const arr: T[] = []
    for await (const x of iterable) arr.push(x)
    return arr
}
