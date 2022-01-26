import type { ProducerPushFunction } from '../types'
import type { NonFungibleTokenAPI } from '@masknet/web3-providers'

export async function collectAllPageData<T>(
    fetcher: (page: number, pageInfo: { [key in string]: unknown }) => Promise<NonFungibleTokenAPI.ProviderPageable<T>>,
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
        pageInfo = result.nextPageInfo ?? {}
        page = page + 1
    }

    return data
}
