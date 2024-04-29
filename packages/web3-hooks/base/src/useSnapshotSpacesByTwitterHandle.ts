import { SnapshotSearch } from '@masknet/web3-providers'
import { useQuery } from '@tanstack/react-query'

export function useSnapshotSpacesByTwitterHandle(handle: string) {
    return useQuery({
        queryKey: ['snapshot-spaces', 'by-twitter-handle', handle],
        queryFn: async () => {
            if (!handle) return null
            const spaceList = await SnapshotSearch.get()
            const _handle = handle.toLowerCase()
            return spaceList.filter((x) => x.twitterHandler?.toLowerCase() === _handle)
        },
    })
}
