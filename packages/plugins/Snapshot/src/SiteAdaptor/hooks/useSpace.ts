import { Snapshot } from '@masknet/web3-providers'
import { useQuery } from '@tanstack/react-query'

export function useSpace(spaceId: string) {
    return useQuery({
        queryKey: ['space', spaceId],
        async queryFn() {
            if (!spaceId) return null
            return Snapshot.getSpace(spaceId)
        },
    })
}
