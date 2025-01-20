import { type FireflyRedPacketAPI } from '@masknet/web3-providers/types'
import { useInfiniteQuery } from '@tanstack/react-query'
import { createIndicator } from '@masknet/shared-base'
import { FireflyRedPacket } from '@masknet/web3-providers'

export function useRedPacketHistory(address: string, historyType: FireflyRedPacketAPI.ActionType) {
    return useInfiniteQuery({
        queryKey: ['redpacket', 'history', address, historyType],
        initialPageParam: createIndicator(undefined, ''),
        queryFn: async ({ pageParam }) => {
            const res = await FireflyRedPacket.getHistory(historyType, address as `0x${string}`, pageParam)
            return res
        },
        getNextPageParam: (lastPage) => lastPage.nextIndicator,
        select(data) {
            return data.pages.flatMap((x) => x.data)
        },
        gcTime: 0,
    })
}
