import { useAsync } from 'react-use'
import { Services } from '../../../API'

export function usePosts(network: string, useIds: string[]) {
    return useAsync(async () => {
        return Services.Identity.queryPostHistoryByIdentifiers(network, useIds)
    }, [network, useIds.join()])
}
