export async function* asyncIteratorWithResult<T, R, N>(iter: AsyncIterator<T, R, N>) {
    let yielded: IteratorResult<T, R>
    do {
        yielded = await iter.next()
        if (yielded.done) yield yielded
        else yield yielded
    } while (yielded.done === false)
    return
}

export function asyncIteratorToAsyncFunction<Args extends any[], T, R>(
    f: (...args: Args) => AsyncIterator<T, R, undefined>,
) {
    return async function(...args: Args): Promise<R> {
        for await (const _ of asyncIteratorWithResult(f(...args))) {
            if (_.done) return _.value
        }
        throw new TypeError('Invalid iterator state')
    }
}
