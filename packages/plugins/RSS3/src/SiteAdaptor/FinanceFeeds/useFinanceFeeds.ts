import { t } from '@lingui/core/macro'
import { timeout } from '@masknet/kit'
import type { PageIndicator } from '@masknet/shared-base'
import { FireflyWalletHistory } from '@masknet/web3-providers'
import { skipToken, useInfiniteQuery } from '@tanstack/react-query'

interface Options {
    address: string | undefined
}

export function useFinanceFeeds({ address }: Options) {
    return useInfiniteQuery({
        initialPageParam: undefined as PageIndicator | undefined,
        queryKey: ['firefly', 'wallet-history', address],
        queryFn:
            address ?
                async ({ pageParam }) => {
                    return timeout(
                        FireflyWalletHistory.getTransactions(address, { indicator: pageParam }),
                        30_000,
                        t`Request timed out`,
                    )
                }
            :   skipToken,
        getNextPageParam: (lp) => lp.nextIndicator as PageIndicator | undefined,
        select(data) {
            return data.pages.flatMap((page) => page.data)
        },
    })
}
