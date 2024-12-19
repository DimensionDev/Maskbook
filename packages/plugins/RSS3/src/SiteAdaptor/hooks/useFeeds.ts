import { skipToken, useInfiniteQuery } from '@tanstack/react-query'
import { RSS3 } from '@masknet/web3-providers'
import { createIndicator, createPageable, EMPTY_LIST, type PageIndicator } from '@masknet/shared-base'
import type { RSS3BaseAPI } from '@masknet/web3-providers/types'

interface Options {
    tag: RSS3BaseAPI.Tag[]
    network: RSS3BaseAPI.Network[]
    direction: string
}

export function useFeeds(address: string | undefined, options?: Partial<Options>) {
    return useInfiniteQuery({
        queryKey: ['rss3-feeds', address, options],
        initialPageParam: undefined as PageIndicator | undefined,
        queryFn:
            address ?
                async ({ pageParam }) => {
                    // if network is omitted, it will be treated as all networks.
                    if (options?.network && options.network.length === 0) {
                        return createPageable([], createIndicator())
                    }
                    return RSS3.getAllNotes(address, options, { indicator: pageParam, size: 20 })
                }
            :   skipToken,
        getNextPageParam: (lastPage) => lastPage?.nextIndicator,
        select: (data) => data.pages.flatMap((page) => page.data) || EMPTY_LIST,
    })
}
