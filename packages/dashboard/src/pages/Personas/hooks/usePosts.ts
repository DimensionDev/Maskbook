import { useAsync } from 'react-use'
import { Services } from '../../../API'

export function usePosts(network: string, useIds: string[], page: number) {
    return useAsync(async () => {
        return Services.Identity.queryPagedPostHistoryByIdentifiers(network, useIds, page, 5)
    }, [network, useIds.join(), page])
}
