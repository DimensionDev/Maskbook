import { Zerion } from '@masknet/web3-providers'
import { skipToken, useInfiniteQuery } from '@tanstack/react-query'

interface Options {
    address: string | undefined
}

export function useFinanceFeeds({ address }: Options) {
    return useInfiniteQuery({
        initialPageParam: undefined as any,
        queryKey: ['zerion', 'history-list', address],
        queryFn:
            address ?
                async ({ pageParam }) => {
                    return Zerion.getTransactions(address, { indicator: pageParam })
                }
            :   skipToken,
        getNextPageParam: (lp) => lp.nextIndicator,
        select(data) {
            return data.pages.flatMap((page) => page.data)
        },
    })
}
