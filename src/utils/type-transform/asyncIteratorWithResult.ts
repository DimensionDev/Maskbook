export async function* asyncIteratorWithResult<T, R, N>(iter: AsyncIterator<T, R, N>) {
    let yielded: IteratorResult<T, R>
    do {
        yielded = await iter.next()
        if (yielded.done) yield yielded
        else yield yielded
    } while (yielded.done === false)
    return
}
