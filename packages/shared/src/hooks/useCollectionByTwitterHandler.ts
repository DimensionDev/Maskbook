import type { Web3Helper } from '@masknet/web3-helpers'
import { DSearch } from '@masknet/web3-providers'
import { SearchResultType } from '@masknet/web3-shared-base'
import { useAsync } from 'react-use'

export function useCollectionByTwitterHandler(twitterHandler?: string) {
    return useAsync(async () => {
        if (!twitterHandler) return
        return DSearch.search<Web3Helper.TokenResultAll>(
            twitterHandler,
            SearchResultType.CollectionListByTwitterHandler,
        )
    }, [twitterHandler])
}
