import { useInfiniteQuery } from '@tanstack/react-query'
import { GoogleDriveClient } from '@masknet/web3-providers'
import { compact } from 'lodash-es'
import { clearGoogleDriveAccessToken, getGoogleDriveAccessToken } from '../pages/SetupPersona/Backup/helpers.js'

const defaultClient = new GoogleDriveClient(getGoogleDriveAccessToken, clearGoogleDriveAccessToken)
export function useGoogleDriveFiles(client: GoogleDriveClient = defaultClient) {
    return useInfiniteQuery({
        enabled: client.hasLogin,
        queryKey: ['google-drive', 'files'],
        initialPageParam: '',
        queryFn: (param) => {
            return client.listBackupFiles({
                pageSize: '100',
                pageToken: param.pageParam,
            })
        },
        getNextPageParam: () => '',
        select(data) {
            return compact(data.pages.flatMap((x) => x))
        },
    })
}
