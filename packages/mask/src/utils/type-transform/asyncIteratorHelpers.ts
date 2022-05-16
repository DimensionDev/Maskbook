export async function asyncIteratorToArray<T>(it: AsyncIterable<T>) {
    const arr: T[] = []
    for await (const x of it) arr.push(x)
    return arr
}
