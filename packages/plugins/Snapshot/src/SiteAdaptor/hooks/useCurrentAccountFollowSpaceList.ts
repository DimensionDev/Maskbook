import { useChainContext } from '@masknet/web3-hooks-base'
import { Snapshot } from '@masknet/web3-providers'
import { useQuery } from '@tanstack/react-query'

export function useCurrentAccountFollowSpaceList() {
    const { account } = useChainContext()
    return useQuery({
        queryKey: ['following-space-list', account],
        async queryFn() {
            if (!account) return []

            return Snapshot.getFollowingSpaceIdList(account)
        },
    })
}
