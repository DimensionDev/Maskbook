import type { ProducerPushFunction } from '../types'

interface Response<T> {
    data: T[]
    hasNextPage?: boolean
}

export async function collectAllPageDate<T>(
    fetcher: (page: number) => Promise<Response<T>>,
    handler?: ProducerPushFunction<T>,
) {
    let data: T[] = []
    let hasNextPage = true
    let page = 0
    while (hasNextPage) {
        const result = await fetcher(page)
        await handler?.(result.data)
        data = [...data, ...result.data]
        hasNextPage = !!result.hasNextPage
        page = page + 1
    }

    return data
}
