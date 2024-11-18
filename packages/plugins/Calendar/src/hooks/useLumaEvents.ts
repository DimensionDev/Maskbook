import { Luma } from '@masknet/web3-providers'
import { useInfiniteQuery } from '@tanstack/react-query'

export function useLumaEvents() {
    return useInfiniteQuery({
        queryKey: ['lumaEvents'],
        initialPageParam: undefined as any,
        queryFn: async ({ pageParam }) => {
            return Luma.getEvents(pageParam)
        },
        getNextPageParam(page) {
            return page.nextIndicator
        },
        select(data) {
            return data.pages.flatMap((x) => x.data)
        },
    })
}
