import type { ProducerPushFunction } from '../types'
import type { NonFungibleTokenAPI } from '@masknet/web3-providers'

export async function collectAllPageData<T>(
    fetcher: (
        page: number,
        pageInfo: { [key in string]: unknown },
        pageKey: string | undefined,
    ) => Promise<NonFungibleTokenAPI.ProviderPageable<T>>,
    pageSize: number,
    handler?: ProducerPushFunction<T>,
) {
    let data: T[] = []
    let hasNextPage = true
    let page = 0
    let pageInfo = {}
    let pageKey = ''
    while (hasNextPage) {
        const result = await fetcher(page, pageInfo, pageKey)
        await handler?.(result.data)
        data = [...data, ...result.data]
        hasNextPage =
            (result.hasNextPage || Boolean(result.pageKey)) &&
            result.data.length > 0 &&
            (result.total ? result.total > data.length : true)
        pageInfo = result.nextPageInfo ?? {}
        pageKey = result.pageKey || ''
        page = page + 1
    }

    return data
}
