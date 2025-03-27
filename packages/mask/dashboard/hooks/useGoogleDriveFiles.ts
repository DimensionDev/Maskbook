import { useInfiniteQuery } from '@tanstack/react-query'
import { UserContext } from '../../shared-ui/index.js'
import { GoogleDriveClient } from '@masknet/web3-providers'
import { compact } from 'lodash-es'

export function useGoogleDriveFiles() {
    const { user } = UserContext.useContainer()
    return useInfiniteQuery({
        queryKey: ['google-drive', 'files', user.googleToken],
        initialPageParam: '',
        queryFn: (param) => {
            if (!user.googleToken) return null
            const client = new GoogleDriveClient(user.googleToken)
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
