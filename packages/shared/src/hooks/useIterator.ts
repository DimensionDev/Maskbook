export function useIterator<T>(iterator: AsyncGenerator<T | Error, void, undefined> | undefined, size = PageSize) {
    const [done, setDone] = useState(false)
    const [loading, toggleLoading] = useState(false)
    const [error, setError] = useState<string>()
    const [data, setData] = useState<T[]>(EMPTY_LIST)
    const next = useCallback(async () => {
        if (!iterator || done) return
        const batchFollowers: T[] = []
        toggleLoading(true)
        try {
            for (const _ of Array.from({ length: size })) {
                const { value, done: iteratorDone } = await iterator.next()
                if (value instanceof Error) {
                    setError(value.message)
                    break
                }
                if (iteratorDone) {
                    setDone(true)
                    break
                }
                if (value) {
                    batchFollowers.push(value)
                }
            }
        } catch (error_) {
            setError(error_ as string)
            setDone(true)
        }

        setData((pred) => [...pred, ...batchFollowers])
        toggleLoading(false)
    }, [iterator, done])

    const retry = useCallback(() => {
        setError(undefined)
        setData(EMPTY_LIST)
        setDone(false)
    }, [])

    return {
        value: data,
        next,
        done,
        loading,
        error,
        retry,
    }
}
