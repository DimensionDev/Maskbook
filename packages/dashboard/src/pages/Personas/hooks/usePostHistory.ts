import { useAsync } from 'react-use'
import { Services } from '../../../API'

export function usePostHistory(network: string, useIds: string[], page: number, pageSize: number = 20) {
    return useAsync(async () => {
        return Services.Identity.queryPagedPostHistoryByIdentifiers(network, useIds, page, pageSize)
    }, [network, useIds.join(), page, pageSize])
}
