import { FireflyRedPacketAPI } from '@masknet/web3-providers/types'
import { useSuspenseInfiniteQuery, type UseSuspenseInfiniteQueryResult, type InfiniteData } from '@tanstack/react-query'
import { createIndicator } from '@masknet/shared-base'
import { FireflyRedPacket } from '@masknet/web3-providers'
import type { Pageable, PageIndicator } from '@masknet/shared-base'

export function useRedPacketHistory(
    address: string,
    historyType: FireflyRedPacketAPI.ActionType,
    platform?: FireflyRedPacketAPI.SourceType,
): UseSuspenseInfiniteQueryResult<
    InfiniteData<
        Pageable<FireflyRedPacketAPI.RedPacketClaimedInfo | FireflyRedPacketAPI.RedPacketSentInfo, PageIndicator>
    >
> {
    return useSuspenseInfiniteQuery({
        queryKey: ['redpacket', 'history', address, historyType],
        initialPageParam: createIndicator(undefined, ''),
        queryFn: async ({ pageParam }) => {
            const res = await FireflyRedPacket.getHistory(
                historyType,
                address as `0x${string}`,
                platform ? platform : FireflyRedPacketAPI.SourceType.All,
                pageParam,
            )
            return res
        },
        getNextPageParam: (lastPage) => lastPage.nextIndicator,
    })
}
