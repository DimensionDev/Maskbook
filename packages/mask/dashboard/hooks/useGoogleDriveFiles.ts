import type { GoogleDriveClient } from '@masknet/web3-providers'
import { useInfiniteQuery } from '@tanstack/react-query'
import { compact } from 'lodash-es'
import { UserContext } from '../../shared-ui/index.js'

export function useGoogleDriveFiles(client: GoogleDriveClient) {
    const { user } = UserContext.useContainer()

    const query = useInfiniteQuery({
        enabled: !!user.googleAccount,
        queryKey: ['google-drive', 'files', user.googleAccount],
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
    return query
}
