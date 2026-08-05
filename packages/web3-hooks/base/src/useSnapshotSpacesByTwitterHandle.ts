import { SnapshotSearch } from '@masknet/web3-providers'
import type { DAOResult } from '@masknet/web3-shared-base'
import type { ChainId } from '@masknet/web3-shared-evm'
import { useQuery } from '@tanstack/react-query'
import type { UseQueryResult } from '@tanstack/react-query'

export function useSnapshotSpacesByTwitterHandle(
    handle: string,
): UseQueryResult<Array<DAOResult<ChainId.Mainnet>> | null> {
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
