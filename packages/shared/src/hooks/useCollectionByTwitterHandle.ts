import type { Web3Helper } from '@masknet/web3-helpers'
import { DSearch } from '@masknet/web3-providers'
import { SearchResultType } from '@masknet/web3-shared-base'
import { useQuery } from '@tanstack/react-query'

export function useCollectionByTwitterHandle(handle?: string) {
    const { data: collections } = useQuery({
        queryKey: ['collections', 'by-twitter-handle', handle],
        queryFn: async () => {
            if (!handle) return null
            return DSearch.search<Web3Helper.TokenResultAll>(handle, SearchResultType.CollectionListByTwitterHandle)
        },
    })
    return collections
}
