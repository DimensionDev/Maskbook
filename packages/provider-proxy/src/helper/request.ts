interface Response<T> {
    data: T[]
    hasNextPage?: boolean
}

export async function collectAllPageDate<T>(fetcher: () => Promise<Response<T>>) {
    let data: T[] = []
    let hasNextPage = true
    while (hasNextPage) {
        const result = await fetcher()
        data = [...data, ...result.data]
        hasNextPage = !!result.hasNextPage
    }

    return data
}
