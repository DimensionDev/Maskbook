import type { ProducerPushFunction } from '../types'

export async function collectAllPageDate<T>(
    fetcher: (page: number) => Promise<T[]>,
    pageSize: number,
    handler?: ProducerPushFunction<T>,
) {
    let data: T[] = []
    let hasNextPage = true
    let page = 0
    while (hasNextPage) {
        const result = await fetcher(page)
        await handler?.(result)
        data = [...data, ...result]
        hasNextPage = result.length === pageSize
        page = page + 1
    }

    return data
}
