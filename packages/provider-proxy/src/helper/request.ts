import type { ProducerPushFunction } from '../types'
import type { Pageable } from '@masknet/web3-shared-base'

export async function collectAllPageDate<T>(
    fetcher: (page: number, pageInfo: { [key in string]: unknown }) => Promise<Pageable<T>>,
    pageSize: number,
    handler?: ProducerPushFunction<T>,
) {
    let data: T[] = []
    let hasNextPage = true
    let page = 0
    let pageInfo = {}
    while (hasNextPage) {
        const result = await fetcher(page, pageInfo)
        await handler?.(result.data)
        data = [...data, ...result.data]
        hasNextPage = result.hasNextPage
        // pageInfo = result.nextPageInfo ?? {}
        page = page + 1
    }

    return data
}
